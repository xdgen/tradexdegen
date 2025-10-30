import { useMemo } from "react";
import { useAnchor } from "./useAnchor";
import { Program, BN, AnchorProvider } from "@coral-xyz/anchor";
import TradeIDL from "../lib/contracts/trade/trade.json"
import type { XdegenDemo as XdegenTrade } from "@/lib/contracts/trade/trade";
import { Connection, Keypair,  PublicKey, Transaction } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import supabase from "../components/testToken/database";
import useEphemeral from "./useEphemeral";
import { GetCommitmentSignature } from "@magicblock-labs/ephemeral-rollups-sdk"

const network = import.meta.env.VITE_SOLANA_RPC_URL_ARRAY.split(',')[1];
const mainnetConnection = new Connection(network)

export type TokenParams = {
    name: string;
    symbol: string;
    decimals?: number;
    mint: PublicKey,
    uri?: string;
    supply: number | BN;
}

export const useTrade = () => {
    const provider = useAnchor();
    const magicProvider = useEphemeral();
    const program = useMemo(() => {
        if (!provider) return null;
        return new Program(
            TradeIDL as XdegenTrade, 
            provider
        ) as Program<XdegenTrade>;
    }, [provider]);
   
    const programId = useMemo(() => new PublicKey(TradeIDL.address), []);
    const mainMint = new PublicKey("3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce");
    
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

            const transaction = new Transaction();
            const initializeTx = await program.methods.initialize()
            .accountsPartial({
                admin: provider.wallet.publicKey,
                config: getConfigPDA(),
                xdegenMint: mainMint, 
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .remainingAccounts([
                {
                    pubkey: new PublicKey('mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev'),
                    isSigner: false,
                    isWritable: false
                }
            ])
            .transaction();

            transaction.add(initializeTx)
            const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash('finalized');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = provider.wallet.publicKey;

            // Sign and send transaction
            const signedTransaction = await provider.wallet.signTransaction(transaction);
            const txId = await provider.connection.sendRawTransaction(
                signedTransaction.serialize(),
                {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed'
                }
            );
            await provider.connection.confirmTransaction({
                signature: txId,
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight
            }, 'confirmed');
            console.log('your signature', txId)
            return txId
        },
        onSuccess: async (tx) => {
            toast.success(`Account initialized successfully\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        }
    })

    const delegateConfig = useMutation({
        mutationKey: ['delegate', 'config'],
        mutationFn: async () => {
            if (!provider || !provider.wallet.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
            }

            let delegateTx = await program.methods
                .delegateConfig()
                .accounts({
                    admin: provider.wallet.publicKey,
                    config: getConfigPDA()
                }).transaction();

            const {
                value: { blockhash, lastValidBlockHeight }
            } = await provider.connection.getLatestBlockhashAndContext();

            delegateTx.recentBlockhash = blockhash;
            delegateTx.feePayer = provider.wallet.publicKey;

            console.log('publickey', provider.wallet.publicKey.toBase58())

            const signedTx = await provider.wallet.signTransaction(delegateTx);
            const txHash = await provider.connection.sendRawTransaction(
                signedTx.serialize(),
                {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed'
                }
            );
            await provider.connection.confirmTransaction({
                signature: txHash,
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight
            }, 'confirmed');
            console.log(txHash);
            return txHash
        }
    })

    const deposit = useMutation({
        mutationKey: ["deposit"],
        mutationFn: async (amount: number) => {
            if (!provider || !provider.wallet?.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
            }

            const xdegenInfo = await getMintInfo(mainMint);
            amount = amount * Math.pow(10, xdegenInfo.decimals);

            const configAccount = await program.account.config.fetch(getConfigPDA());
            const adminTokenAccount = await getAssociatedTokenAddress(
                mainMint,
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
            
            const transaction = new Transaction();
            const depositTx = await program.methods.deposit(new BN(amount))
            .accountsPartial({
                admin: configAccount.admin,
                config: getConfigPDA(),
                mint: mainMint,
                adminTokenAccount,
                vault: configAccount.vault,
                tokenProgram: TOKEN_PROGRAM_ID
            }).transaction();

            transaction.add(depositTx);
            transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
            transaction.feePayer = provider.wallet.publicKey;

            // Sign and send transaction
            const signedTransaction = await provider.wallet.signTransaction(transaction);
            const txId = await provider.connection.sendRawTransaction(signedTransaction.serialize());
            await provider.connection.confirmTransaction(txId);
            return txId;
        },
        onSuccess: async (tx) => {
            toast.success(`Deposit was successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`);
        }
    })

    const buy = useMutation({
        mutationKey: ["buy"],
        mutationFn: async ({
            buyAmount,
            tokenParams,
        }: {
            buyAmount: number;
            tokenParams: TokenParams;
        }) => {
            if (!provider || !provider.wallet?.publicKey || !program || !magicProvider) {
                throw new Error("Wallet not connected. Please connect your wallet to use trading features.");
            }

            const xdegenMintInfo = await getMintInfo(mainMint);
            if (!xdegenMintInfo) {
                throw new Error(`Mint info not found for mint: ${tokenParams.mint}`)
            }

            const tokenToBuyInfo = await getMint(mainnetConnection, tokenParams.mint);
            if (!tokenToBuyInfo) {
                throw new Error(`Mint info not found for mint: ${tokenParams.mint}`)
            }

            tokenParams.decimals = tokenToBuyInfo.decimals;
            tokenParams.uri = "https://random.ipfs"

            const walletXdegenAta = await getAssociatedTokenAddress(
                mainMint,
                provider.wallet.publicKey
            );
            const adjustedBuyAmount = buyAmount * Math.pow(10, xdegenMintInfo.decimals);

            const supply = tokenParams.supply * Math.pow(10, tokenParams.decimals)
            tokenParams.supply = new BN(supply)

            let memeData;
            try {
                console.log('meme record', tokenParams, provider.wallet.publicKey.toBase58(), tokenParams.mint.toBase58())
                memeData = await supabase
                    .from('meme')
                    .select()
                    .eq('mainMint', tokenParams.mint)
                    .eq('name', tokenParams.name)
                    .eq('wallet', provider.wallet.publicKey.toBase58())
                    .maybeSingle();

                console.log(memeData)

            } catch (error) {
                console.error('Error querying meme data:', error);
                throw new Error(`Failed to query meme data: ${error instanceof Error ? error.message : String(error)}`);
            }

            const configAccount = await program.account.config.fetch(getConfigPDA());
            if (memeData.data) {
                console.log('minting token...');
                const existingMint = new PublicKey(memeData.data.mint); 
                const buyerMintAta = await getAssociatedTokenAddress(existingMint, provider.wallet.publicKey)
                
                const transaction = new Transaction();
                const mintTokenTx = await program.methods.mintToken(
                    new BN(adjustedBuyAmount),
                    tokenParams.supply
                )
                .accountsPartial({
                    buyer: magicProvider.wallet.publicKey,
                    admin: configAccount.admin,
                    config: getConfigPDA(),
                    mint: existingMint,
                    xdegenMint: mainMint,
                    vault: configAccount.vault,
                    buyerXdegenAta: walletXdegenAta,
                    buyerMintAta: buyerMintAta,
                    tokenProgram: TOKEN_PROGRAM_ID
                }).transaction();

                transaction.add(mintTokenTx);
                const { blockhash, lastValidBlockHeight } = await magicProvider.connection.getLatestBlockhash('finalized');
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = magicProvider.wallet.publicKey;

                // Sign and send transaction
                const signedTransaction = await magicProvider.wallet.signTransaction(transaction);
                const txId = await magicProvider.connection.sendRawTransaction(
                    signedTransaction.serialize(),
                    {
                        skipPreflight: false,
                        preflightCommitment: 'confirmed'
                    }
                );
                await provider.connection.confirmTransaction({
                    signature: txId,
                    blockhash: blockhash,
                    lastValidBlockHeight: lastValidBlockHeight
                }, 'confirmed');
                console.log('your signature', txId)

                return txId
            } else {
                console.log('Buying token initially');
                const newMint = Keypair.generate();
                const userMintAta = await getAssociatedTokenAddress(newMint.publicKey, provider.wallet.publicKey);

                // Add buy instruction to the same transaction
                const buyTx = await program.methods.buy(tokenParams, new BN(adjustedBuyAmount))
                .accountsPartial({
                    trader: provider.wallet.publicKey,
                    admin: configAccount.admin,
                    config: getConfigPDA(),
                    vault: configAccount.vault,
                    mint: newMint.publicKey,
                    traderMintAta: userMintAta,
                    metadata: getMetadataPDA(newMint.publicKey),
                    xdegenMint: mainMint,
                    traderXdegenAta: walletXdegenAta,
                    tokenProgram: TOKEN_PROGRAM_ID
                }).transaction();

                const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
                buyTx.recentBlockhash = blockhash;
                buyTx.feePayer = provider.wallet.publicKey;

                // Sign and send transaction
                buyTx.partialSign(newMint);
                const signedTransaction = await magicProvider.wallet.signTransaction(buyTx);
                const txId = await provider.connection.sendRawTransaction(
                signedTransaction.serialize(),
                {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed'
                }
            );
            await provider.connection.confirmTransaction({
                signature: txId,
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight
            }, 'confirmed');
                const txCommitSgn = await GetCommitmentSignature(
                    txId,
                    magicProvider.connection
                )
                console.log('your signature', txId, txCommitSgn)

                // save to supabase
                const { error } = await supabase.from('meme')
                .insert({ 
                    mainMint: tokenParams.mint.toBase58(),
                    mint: newMint.publicKey.toBase58(),
                    name: tokenParams.name,
                    wallet: magicProvider.wallet.publicKey.toBase58()
                });

                if (error) {
                    console.error(error)
                    throw error
                }

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
            const userXdegenAta = await getAssociatedTokenAddress(mainMint, provider.wallet.publicKey);

            const transaction = new Transaction();
            const sellTx = await program.methods.sell(
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
                xdegenMint: mainMint,
                traderXdegenAta: userXdegenAta,
                tokenProgram: TOKEN_PROGRAM_ID
            }).transaction();

            transaction.add(sellTx);
            const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash('finalized');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = provider.wallet.publicKey;

            // Sign and send transaction
            const signedTransaction = await provider.wallet.signTransaction(transaction);
            const txId = await provider.connection.sendRawTransaction(
                signedTransaction.serialize(),
                {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed'
                }
            );
            await provider.connection.confirmTransaction({
                signature: txId,
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight
            }, 'confirmed');
            console.log('your signature', txId)
            return txId
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
            const mintInfo = await getMintInfo(mainMint);
            const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

            const adminXdegenAta = await getAssociatedTokenAddress(mainMint, configAccount.admin);

            const transaction = new Transaction();
            const withdrawTx = await program.methods.withdraw(new BN(adjustedAmount))
            .accountsPartial({
                admin: configAccount.admin,
                config: getConfigPDA(),
                xdegenMint: mainMint,
                vault: configAccount.vault,
                adminXdegenAta: adminXdegenAta
            }).instruction();

            transaction.add(withdrawTx);
            transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
            transaction.feePayer = provider.wallet.publicKey;

            // Sign and send transaction
            const signedTransaction = await provider.wallet.signTransaction(transaction);
            const txId = await provider.connection.sendRawTransaction(signedTransaction.serialize());
            await provider.connection.confirmTransaction(txId);
            return txId;
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
            if (!provider || !provider.wallet?.publicKey || !program) {
                throw new Error("Wallet not connected. Please connect your wallet to claim.");
            }

            const configAccount = await program.account.config.fetch(getConfigPDA());
            const userXdegenAtaOrInstruction = await getOrCreateTokenAccount(provider, mainMint, provider.wallet.publicKey);

            // Build transaction with potential ATA creation + claim
            const transaction = new Transaction();

            let userXdegenAta: PublicKey;
            if (userXdegenAtaOrInstruction instanceof PublicKey) {
                // ATA already exists, just use the address
                userXdegenAta = userXdegenAtaOrInstruction;
            } else {
                // ATA needs to be created, add creation instruction to transaction
                transaction.add(userXdegenAtaOrInstruction);
                userXdegenAta = await getAssociatedTokenAddress(mainMint, provider.wallet.publicKey);
            }

            // Add claim instruction to the same transaction
            const claimTx = await program.methods.claim()
            .accountsPartial({
                claimer: provider.wallet.publicKey,
                config: getConfigPDA(),
                xdegenMint: mainMint,
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
                mainMint.toBuffer()
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
        delegateConfig,
        initialize,
        deposit,
        buy,
        sell,
        withdraw,
        claim
    }
}
