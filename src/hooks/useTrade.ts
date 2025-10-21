import { useMemo } from "react";
import { useAnchor } from "./useAnchor";
import { Program, BN, AnchorProvider } from "@coral-xyz/anchor";
import TradeIDL from "../lib/contracts/trade/trade.json"
import type { XdegenDemo as XdegenTrade } from "@/lib/contracts/trade/trade";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

export const useTrade = () => {
    const provider = useAnchor();
    const program = useMemo(() => {
        if (!provider) return null;
        return new Program(
            TradeIDL as XdegenTrade, 
            provider
        ) as Program<XdegenTrade>;
    }, [provider]);

    const programId = useMemo(() => new PublicKey(TradeIDL.address), []);

    const XdegentMint = new PublicKey("3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce");
    
    const getMintInfo = async (mint: PublicKey) => {
        if (!provider) throw new Error("Wallet not connected");
        return await getMint(provider.connection, mint);
    }

    const initialize = useMutation({
        mutationKey: ["initialize"],
        mutationFn: async () => {
            if (!provider || !provider.wallet?.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
            }
            return await program.methods.initialize()
            .accountsPartial({
                admin: provider.wallet.publicKey,
                config: getConfigPDA(),
                xdegenMint: XdegentMint
            }).rpc();
        },
        onSuccess: async (tx) => {
            toast.success(`Account initialized successfully\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        }
    })

    const deposit = useMutation({
        mutationKey: ["deposit"],
        mutationFn: async (amount: number) => {
            if (!provider || !provider.wallet?.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
            }

            const xdegenInfo = await getMintInfo(XdegentMint);
            amount = amount * Math.pow(10, xdegenInfo.decimals);

            const configAccount = await program.account.config.fetch(getConfigPDA());
            const adminTokenAccount = await getAssociatedTokenAddress(
                XdegentMint,
                configAccount.admin,
            );
            if (!adminTokenAccount) {
                toast.error(`Xdegen balance is zero or account doesn't exist`);
                return
            }

            const adminTokenAccountInfo = await provider.connection.getTokenAccountBalance(adminTokenAccount);
            if (!adminTokenAccountInfo || adminTokenAccountInfo.value.uiAmount === 0) {
                toast.error(`Admin token account has zero balance or doesn't exist`);
                return;
            }

            if (Number(adminTokenAccountInfo.value.amount) < amount) {
                toast.error(`Insufficient balance in admin token account`);
                return;
            }

            return await program.methods.deposit(new BN(amount))
            .accountsPartial({
                admin: configAccount.admin,
                config: getConfigPDA(),
                mint: XdegentMint,
                adminTokenAccount,
                vault: configAccount.vault,
                tokenProgram: TOKEN_PROGRAM_ID
            }).rpc();
        },
        onSuccess: async (tx) => {
            toast.success(`Deposit was successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        }
    })

    const buy = useMutation({
        mutationKey: ["buy"],
        mutationFn: async ({
            mint,
            buyAmount,
            tokenParams,
            pairData
        }: {
            mint: PublicKey;
            buyAmount: number;
            tokenParams: any;
            pairData?: any
        }) => {
            if (!provider || !provider.wallet?.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
            }

            const configAccount = await program.account.config.fetch(getConfigPDA());
            const newMint = Keypair.generate();
            const mintInfo = await getMintInfo(newMint.publicKey);
            const adjustedBuyAmount = buyAmount * Math.pow(10, mintInfo.decimals);

            // Check if user has previously minted this token (has token account)
            const userMintAta = await getAssociatedTokenAddress(mint, provider.wallet.publicKey);
            const mintAccountInfo = await provider.connection.getAccountInfo(userMintAta);

            // Get token info for contract instruction
            const tokenInfo = {
                name: tokenParams.name || "Unknown Token",
                symbol: tokenParams.symbol || "UNKNOWN",
                decimals: mintInfo.decimals,
                uri: tokenParams.uri || "",
                supply: tokenParams.supply
            };

            // Persist tokenMint from pairData if provided using createTokenIfNotExists function
            if (pairData?.tokenMint) {
                try {
                    const { getMeme, createTokenIfNotExists } = await import("../components/testToken/swapfunction");

                    // First check if association already exists
                    const existingAssociation = await getMeme(pairData.tokenMint);

                    if (!existingAssociation) {
                        // No association exists, create new token and save the association
                        console.log(`No existing association found for ${pairData.tokenMint}, creating new token and association`);

                        // Create new token mint (this also saves the association in database)
                        const newTokenMint = await createTokenIfNotExists(tokenInfo.name, pairData.tokenMint);

                        console.log(`Token association created and saved: ${pairData.tokenMint} -> ${newTokenMint}`);
                    } else {
                        console.log(`Existing association found: ${pairData.tokenMint} -> ${existingAssociation}`);
                    }
                } catch (error) {
                    console.error("Failed to persist token association:", error);
                    // No localStorage fallback - let the error propagate
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    throw new Error(`Failed to persist token association: ${errorMessage}`);
                }
            }

            if (mintAccountInfo && mintAccountInfo.data.length > 0) {
                // User has previously minted this token, use mintToken instruction
                const userXdegenAtaOrInstruction = await getOrCreateTokenAccount(provider, XdegentMint, provider.wallet.publicKey);
                const transaction = new Transaction();

                let userXdegenAta: PublicKey;
                if (userXdegenAtaOrInstruction instanceof PublicKey) {
                    userXdegenAta = userXdegenAtaOrInstruction;
                } else {
                    transaction.add(userXdegenAtaOrInstruction);
                    userXdegenAta = await getAssociatedTokenAddress(XdegentMint, provider.wallet.publicKey);
                }

                const mintTokenTx = await program.methods.mintToken(
                    new BN(adjustedBuyAmount),
                    new BN(tokenParams.xsolAmount * Math.pow(10, mintInfo.decimals))
                )
                .accountsPartial({
                    buyer: provider.wallet.publicKey,
                    admin: configAccount.admin,
                    config: getConfigPDA(),
                    mint: mint,
                    xdegenMint: XdegentMint,
                    vault: configAccount.vault,
                    buyerXdegenAta: userXdegenAta,
                    buyerMintAta: userMintAta,
                    tokenProgram: TOKEN_PROGRAM_ID
                }).transaction();

                transaction.add(mintTokenTx);
                transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
                transaction.feePayer = provider.wallet.publicKey;

                // Sign and send transaction
                const signedTransaction = await provider.wallet.signTransaction(transaction);
                const txId = await provider.connection.sendRawTransaction(signedTransaction.serialize());
                await provider.connection.confirmTransaction(txId);

                return txId;
            } else {
                // User doesn't have mint token, use buy instruction (initializes the token)
                const userXdegenAtaOrInstruction = await getOrCreateTokenAccount(provider, XdegentMint, provider.wallet.publicKey);

                // Build transaction with potential ATA creation + buy
                const transaction = new Transaction();

                let userXdegenAta: PublicKey;
                if (userXdegenAtaOrInstruction instanceof PublicKey) {
                    // ATA already exists, just use the address
                    userXdegenAta = userXdegenAtaOrInstruction;
                } else {
                    // ATA needs to be created, add creation instruction to transaction
                    transaction.add(userXdegenAtaOrInstruction);
                    userXdegenAta = await getAssociatedTokenAddress(XdegentMint, provider.wallet.publicKey);
                }

                // Add buy instruction to the same transaction
                const buyTx = await program.methods.buy(tokenInfo, new BN(adjustedBuyAmount))
                .accountsPartial({
                    trader: provider.wallet.publicKey,
                    admin: configAccount.admin,
                    config: getConfigPDA(),
                    vault: configAccount.vault,
                    mint: mint,
                    traderMintAta: userMintAta,
                    metadata: getMetadataPDA(mint),
                    xdegenMint: XdegentMint,
                    traderXdegenAta: userXdegenAta,
                    tokenProgram: TOKEN_PROGRAM_ID
                }).transaction();

                transaction.add(buyTx);
                transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
                transaction.feePayer = provider.wallet.publicKey;

                // Sign and send transaction
                const signedTransaction = await provider.wallet.signTransaction(transaction);
                const txId = await provider.connection.sendRawTransaction(signedTransaction.serialize());
                await provider.connection.confirmTransaction(txId);

                return txId;
            }
        },
        onSuccess: async (tx) => {
            toast.success(`Buy transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        },
        onError: (error) => {
            toast.error(`Buy transaction failed: ${error.message}`);
        }
    });

    // const buy = useMutation({
    //     mutationKey: ["buy", provider?.wallet?.publicKey?.toBase58() || "disconnected"],
    //     mutationFn: async ({ mint, buyAmount, amount, tokenParams }: { mint: PublicKey; buyAmount: 0.5 | 1.0 | 1.5 | 2.0 | 2.5 | 3.0 | 4.0, amount: number; tokenParams: any }) => {
    //         if (!provider || !provider.wallet?.publicKey || !program) {
    //             throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
    //         }

    //         const configAccount = await program.account.config.fetch(getConfigPDA());
    //         const mintInfo = await getMintInfo(mint);
    //         const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

    //         // Check if user has mint token in wallet or if mint token info is valid
    //         const userMintAta = await getAssociatedTokenAddress(mint, provider.wallet.publicKey);
    //         const mintAccountInfo = await provider.connection.getAccountInfo(userMintAta);

    //         if (mintAccountInfo && mintAccountInfo.data.length > 0) {
    //             const userXdegenAtaOrInstruction = await getOrCreateTokenAccount(provider, XdegentMint, provider.wallet.publicKey);
    //             const transaction = new Transaction();

    //             let userXdegenAta: PublicKey;
    //             if (userXdegenAtaOrInstruction instanceof PublicKey) {
    //                 userXdegenAta = userXdegenAtaOrInstruction;
    //             } else {
    //                 transaction.add(userXdegenAtaOrInstruction);
    //                 userXdegenAta = await getAssociatedTokenAddress(XdegentMint, provider.wallet.publicKey);
    //             }

    //             const mintTokenTx = await program.methods.mintToken(
    //                 new BN(adjustedAmount),
    //                 new BN(amount * Math.pow(10, mintInfo.decimals))
    //             )
    //             .accountsPartial({
    //                 buyer: provider.wallet.publicKey,
    //                 admin: configAccount.admin,
    //                 config: getConfigPDA(),
    //                 mint: mint,
    //                 xdegenMint: XdegentMint,
    //                 vault: configAccount.vault,
    //                 buyerXdegenAta: userXdegenAta,
    //                 buyerMintAta: userMintAta,
    //                 tokenProgram: TOKEN_PROGRAM_ID
    //             }).transaction();

    //             transaction.add(mintTokenTx);
    //             transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    //             transaction.feePayer = provider.wallet.publicKey;

    //             // Sign and send transaction
    //             const signedTransaction = await provider.wallet.signTransaction(transaction);
    //             const txId = await provider.connection.sendRawTransaction(signedTransaction.serialize());
    //             await provider.connection.confirmTransaction(txId);

    //             return txId;
    //         } else {
    //             // User doesn't have mint token, use buy instruction (initializes the token)
    //             const userXdegenAtaOrInstruction = await getOrCreateTokenAccount(provider, XdegentMint, provider.wallet.publicKey);

    //             // Build transaction with potential ATA creation + buy
    //             const transaction = new Transaction();

    //             let userXdegenAta: PublicKey;
    //             if (userXdegenAtaOrInstruction instanceof PublicKey) {
    //                 // ATA already exists, just use the address
    //                 userXdegenAta = userXdegenAtaOrInstruction;
    //             } else {
    //                 // ATA needs to be created, add creation instruction to transaction
    //                 transaction.add(userXdegenAtaOrInstruction);
    //                 userXdegenAta = await getAssociatedTokenAddress(XdegentMint, provider.wallet.publicKey);
    //             }

    //             // Add buy instruction to the same transaction
    //             const buyTx = await program.methods.buy(tokenParams, new BN(adjustedAmount))
    //             .accountsPartial({
    //                 trader: provider.wallet.publicKey,
    //                 admin: configAccount.admin,
    //                 config: getConfigPDA(),
    //                 vault: configAccount.vault,
    //                 mint: mint,
    //                 traderMintAta: userMintAta,
    //                 metadata: getMetadataPDA(mint),
    //                 xdegenMint: XdegentMint,
    //                 traderXdegenAta: userXdegenAta,
    //                 tokenProgram: TOKEN_PROGRAM_ID
    //             }).transaction();

    //             transaction.add(buyTx);
    //             transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    //             transaction.feePayer = provider.wallet.publicKey;

    //             // Sign and send transaction
    //             const signedTransaction = await provider.wallet.signTransaction(transaction);
    //             const txId = await provider.connection.sendRawTransaction(signedTransaction.serialize());
    //             await provider.connection.confirmTransaction(txId);

    //             return txId;
    //         }
    //     },
    //     onSuccess: async (tx) => {
    //         toast.success(`Buy transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
    //     },
    //     onError: (error) => {
    //         toast.error(`Buy transaction failed: ${error.message}`);
    //     }
    // });

    const sell = useMutation({
        mutationKey: ["sell", provider?.wallet?.publicKey?.toBase58() || "disconnected"],
        mutationFn: async ({ mint, sellAmount, burnAmount }: { mint: PublicKey; sellAmount: number; burnAmount: number }) => {
            if (!provider || !provider.wallet?.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
            }

            const configAccount = await program.account.config.fetch(getConfigPDA());
            const mintInfo = await getMintInfo(mint);
            const adjustedSellAmount = sellAmount * Math.pow(10, mintInfo.decimals);
            const adjustedBurnAmount = burnAmount * Math.pow(10, 9); // Assuming 9 decimals for Xdegen

            const userMintAta = await getAssociatedTokenAddress(mint, provider.wallet.publicKey);
            const userXdegenAta = await getAssociatedTokenAddress(XdegentMint, provider.wallet.publicKey);

            return await program.methods.sell(
                new BN(adjustedSellAmount),
                new BN(adjustedBurnAmount)
            )
            .accountsPartial({
                trader: provider.wallet.publicKey,
                admin: configAccount.admin,
                config: getConfigPDA(),
                vault: configAccount.vault,
                mint: mint,
                traderMint: userMintAta,
                xdegenMint: XdegentMint,
                traderXdegenAta: userXdegenAta,
                tokenProgram: TOKEN_PROGRAM_ID
            }).rpc();
        },
        onSuccess: async (tx) => {
            toast.success(`Sell transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        },
        onError: (error) => {
            toast.error(`Sell transaction failed: ${error.message}`);
        }
    });

    const withdraw = useMutation({
        mutationKey: ["withdraw"],
        mutationFn: async (amount: number) => {
            if (!provider || !provider.wallet?.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
            }

            const configAccount = await program.account.config.fetch(getConfigPDA());
            const mintInfo = await getMintInfo(XdegentMint);
            const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

            const adminXdegenAta = await getAssociatedTokenAddress(XdegentMint, configAccount.admin);

            return await program.methods.withdraw(new BN(adjustedAmount))
            .accountsPartial({
                admin: configAccount.admin,
                config: getConfigPDA(),
                xdegenMint: XdegentMint,
                vault: configAccount.vault,
                adminXdegenAta: adminXdegenAta
            }).rpc();
        },
        onSuccess: async (tx) => {
            toast.success(`Withdraw transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        },
        onError: (error) => {
            toast.error(`Withdraw transaction failed: ${error.message}`);
        }
    });

    const claim = useMutation({
        mutationKey: ["claim", provider?.wallet?.publicKey?.toBase58() || "disconnected"],
        mutationFn: async () => {
            console.log(provider, provider?.wallet.publicKey.toBase58(), program, provider?.wallet.payer)
            if (!provider || !provider.wallet?.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to claim.");
            }

            const configAccount = await program.account.config.fetch(getConfigPDA());
            const userXdegenAtaOrInstruction = await getOrCreateTokenAccount(provider, XdegentMint, provider.wallet.publicKey);

            // Build transaction with potential ATA creation + claim
            const transaction = new Transaction();

            let userXdegenAta: PublicKey;
            if (userXdegenAtaOrInstruction instanceof PublicKey) {
                // ATA already exists, just use the address
                userXdegenAta = userXdegenAtaOrInstruction;
            } else {
                // ATA needs to be created, add creation instruction to transaction
                transaction.add(userXdegenAtaOrInstruction);
                userXdegenAta = await getAssociatedTokenAddress(XdegentMint, provider.wallet.publicKey);
            }

            // Add claim instruction to the same transaction
            const claimTx = await program.methods.claim()
            .accountsPartial({
                claimer: provider.wallet.publicKey,
                config: getConfigPDA(),
                xdegenMint: XdegentMint,
                vault: configAccount.vault,
                claimerXdegenAta: userXdegenAta,
                tokenProgram: TOKEN_PROGRAM_ID
            }).transaction();

            transaction.add(claimTx);
            transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
            transaction.feePayer = provider.wallet.publicKey;

            // Sign and send transaction
            const signedTransaction = await provider.wallet.signTransaction(transaction);
            const txId = await provider.connection.sendRawTransaction(signedTransaction.serialize());
            await provider.connection.confirmTransaction(txId);

            return txId;
        },
        onSuccess: async (tx) => {
            toast.success(`Claim transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        },
        onError: (error) => {
            toast.error(`Claim transaction failed: ${error.message}`);
        }
    });

    const getConfigPDA = () => {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            programId
        )[0];
    }

    const getMetadataPDA = (mint: PublicKey) => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
                mint.toBuffer()
            ],
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
        )[0];
    }

    const getVaultPDA = () => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("vault"),
                XdegentMint.toBuffer()
            ],
            programId
        )[0];
    }

    // Improved helper function to get or create associated token account
    // Returns either a transaction instruction (if ATA needs to be created) or the ATA address (if it already exists)
    async function getOrCreateTokenAccount(provider: AnchorProvider, mint: PublicKey, owner: PublicKey) {
        try {
            const walletATA = await getAssociatedTokenAddress(mint, owner);

            if (!await provider.connection.getAccountInfo(walletATA)) {
                return createAssociatedTokenAccountInstruction(
                    provider.wallet.publicKey, // payer
                    walletATA,
                    owner, // owner
                    mint
                );
            }

            return walletATA;
        } catch (error) {
            console.error("Failed to get or create associated token account:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to process token account for mint ${mint.toBase58()}: ${errorMessage}`);
        }
    }

    return {
        initialize,
        deposit,
        buy,
        sell,
        withdraw,
        claim
    }
}