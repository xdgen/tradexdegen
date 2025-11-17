import { useMemo } from "react";
import { useAnchor } from "./useAnchor";
import { Program, BN, AnchorProvider } from "@coral-xyz/anchor";
import TradeIDL from "../lib/contracts/trade/trade.json";
import type { XdegenDemo as XdegenTrade } from "@/lib/contracts/trade/trade";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import supabase from "../components/testToken/database";
import { useSessionWallet } from "@magicblock-labs/gum-react-sdk";

const network = import.meta.env.VITE_SOLANA_RPC_URL_ARRAY.split(",")[1];
const mainnetConnection = new Connection(network);

export type TokenParams = {
  name: string;
  symbol: string;
  decimals?: number;
  mint: PublicKey;
  uri?: string;
  supply: number | BN;
};

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
  const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const sessionWallet = useSessionWallet();

  const XdegentMint = new PublicKey(
    "3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce"
  );

  const getMintInfo = async (mint: PublicKey) => {
    if (!provider) throw new Error("Wallet not connected");
    return await getMint(provider.connection, mint);
  };

  const initialize = useMutation({
    mutationKey: ["initialize"],
    mutationFn: async () => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const transaction = new Transaction();
      const initializeTx = await program.methods
        .initialize()
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: getConfigPDA(),
          xdegenMint: XdegentMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction();

      transaction.add(initializeTx);
      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash("finalized");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = provider.wallet.publicKey;

      // Sign and send transaction
      const signedTransaction = await provider.wallet.signTransaction(
        transaction
      );
      const txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );
      await provider.connection.confirmTransaction(
        {
          signature: txId,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        },
        "confirmed"
      );
      console.log("your signature", txId);
      return txId;
    },
    onSuccess: async (tx) => {
      toast.success(
        `Account initialized successfully\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
    },
  });

  const deposit = useMutation({
    mutationKey: ["deposit"],
    mutationFn: async (amount: number) => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const xdegenInfo = await getMintInfo(XdegentMint);
      amount = amount * Math.pow(10, xdegenInfo.decimals);

      const configAccount = await program.account.config.fetch(getConfigPDA());
      const adminTokenAccount = await getAssociatedTokenAddress(
        XdegentMint,
        configAccount.admin
      );
      if (!adminTokenAccount) {
        toast.error(`Xdegen balance is zero or account doesn't exist`);
        return;
      }

      const adminTokenAccountInfo =
        await provider.connection.getTokenAccountBalance(adminTokenAccount);
      if (
        !adminTokenAccountInfo ||
        adminTokenAccountInfo.value.uiAmount === 0
      ) {
        toast.error(`Admin token account has zero balance or doesn't exist`);
        return;
      }

      if (Number(adminTokenAccountInfo.value.amount) < amount) {
        toast.error(`Insufficient balance in admin token account`);
        return;
      }

      const transaction = new Transaction();
      const depositTx = await program.methods
        .deposit(new BN(amount))
        .accountsPartial({
          admin: configAccount.admin,
          config: getConfigPDA(),
          mint: XdegentMint,
          adminTokenAccount,
          vault: configAccount.vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction();

      transaction.add(depositTx);
      transaction.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = provider.wallet.publicKey;

      // Sign and send transaction
      const signedTransaction = await provider.wallet.signTransaction(
        transaction
      );
      const txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await provider.connection.confirmTransaction(txId);
      return txId;
    },
    onSuccess: async (tx) => {
      toast.success(
        `Deposit was successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
    },
  });

  const getMintPDA = (trader: PublicKey, symbol: string) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("mint"),
        trader.toBuffer(),
        Buffer.from(symbol)
      ],
      programId
    )[0]; 
  }

  const getTokenRecordPDA = (trader: PublicKey, mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_record"),
        trader.toBuffer(),
        mint.toBuffer(),
      ],
      programId
    )[0]; 
  }

  const buy = useMutation({
    mutationKey: ["buy"],
    mutationFn: async ({
      buyAmount,
      tokenParams,
    }: {
      buyAmount: number;
      tokenParams: TokenParams;
    }) => {
      if (!provider || !provider.wallet?.publicKey || !program || !provider || !sessionWallet || !provider.wallet?.publicKey) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const xdegenMintInfo = await getMintInfo(XdegentMint);
      if (!xdegenMintInfo) {
        throw new Error(`Mint info not found for mint: ${tokenParams.mint}`);
      }

      const tokenToBuyInfo = await getMint(mainnetConnection, tokenParams.mint);
      if (!tokenToBuyInfo) {
        toast.error(`Token mint info not found for mint: ${tokenParams.mint}`);
        throw new Error(`Mint info not found for mint: ${tokenParams.mint}`);
      }

      tokenParams.decimals = tokenToBuyInfo.decimals;
      tokenParams.uri = "https://random.ipfs";

      const walletXdegenAta = await getAssociatedTokenAddress(
        XdegentMint,
        provider.wallet.publicKey
      );
      const adjustedBuyAmount = buyAmount * Math.pow(10, xdegenMintInfo.decimals);

      const supply = tokenParams.supply * Math.pow(10, tokenParams.decimals);
      tokenParams.supply = new BN(supply);

      let memeData;
      try {
        console.log(
          "meme record",
          tokenParams,
          provider.wallet.publicKey.toBase58(),
          tokenParams.mint.toBase58()
        );
        memeData = await supabase
          .from("meme")
          .select()
          .eq("mainMint", tokenParams.mint)
          .eq("name", tokenParams.name)
          .eq("wallet", provider.wallet.publicKey.toBase58())
          .maybeSingle();

        console.log('memeData:', memeData);
      } catch (error) {
        console.error("Error querying meme data:", error);
        throw new Error(
          `Failed to query meme data: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      // Check if config exists - throw error if not
      const configPDA = getConfigPDA();
      console.log('Config PDA: ', configPDA.toBase58());
      
      const configAccountInfo = await provider.connection.getAccountInfo(configPDA);
      if (!configAccountInfo) {
        throw new Error("Config account does not exist. Please initialize the program first.");
      }

      let sessionToken;
      let needsDelegation = false;

      // Create or get existing session
      if (sessionWallet.sessionToken == null) {
        console.log('Creating session and funding with:', 10000000 / LAMPORTS_PER_SOL, 'SOL');
        const session = await sessionWallet.createSession(
          program.programId,
          100000000,
          60
        );
        
        if (!session || !session.sessionToken) {
          throw new Error("Failed to create session");
        }

        sessionToken = session?.sessionToken;
        needsDelegation = true;
      } else {
        sessionToken = sessionWallet?.sessionToken;

        const sessionBalance = await provider.connection.getBalance(sessionWallet.publicKey!);
        if (sessionBalance < 1000) {
          console.log('Funding existing session with:', (10000000 - sessionBalance) / LAMPORTS_PER_SOL, 'SOL');
          const topUpTx = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: provider.wallet.publicKey,
              toPubkey: sessionWallet.publicKey!,
              lamports: 10000000 - sessionBalance,
            })
          );
          await provider.sendAndConfirm(topUpTx);
        }

        // Check if delegation exists for existing session
        const accountInfo = await provider.connection.getAccountInfo(walletXdegenAta);
        if (accountInfo) {
          const accountData = AccountLayout.decode(accountInfo.data);
          const currentDelegate = accountData.delegate ? new PublicKey(accountData.delegate) : null;
          const delegatedAmount = accountData.delegatedAmount;
          
          if (!currentDelegate || 
              !currentDelegate.equals(sessionWallet.publicKey!) || 
              Number(delegatedAmount) < adjustedBuyAmount) {
            needsDelegation = true;
          }
        }
      }

      // If delegation is needed, approve the session wallet as delegate
      if (needsDelegation) {
        console.log('Approving session wallet as token delegate...');

        if (!sessionWallet.publicKey) {
          throw new Error("Session wallet public key is not available");
        }
        
        // Approve a generous amount (e.g., 1000 tokens or calculate based on expected usage)
        const delegateAmount = Math.max(
          100,
          1000 * Math.pow(10, xdegenMintInfo.decimals) // Or 1000 tokens minimum
        );

        const approveIx = createApproveInstruction(
          walletXdegenAta,
          sessionWallet.publicKey, // Session wallet is the delegate
          provider.wallet.publicKey, // Main wallet is the owner
          delegateAmount
        );

        const approveTx = new Transaction().add(approveIx);
        
        try {
          const signature = await provider.sendAndConfirm(approveTx);
          console.log('Delegation approved:', signature);
        } catch (error) {
          console.log(error)
          throw new Error(
            `Failed to approve delegation: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      const configAccount = await program.account.config.fetch(configPDA);
      if (memeData.data) {
        console.log("minting token...");
        const existingMint = getMintPDA(provider.wallet.publicKey, tokenParams.symbol);
        const buyerMintAta = await getAssociatedTokenAddress(
          existingMint,
          provider.wallet.publicKey
        );

        const mintTokenTx = await program.methods
          .mintToken(new BN(adjustedBuyAmount), tokenParams.supply)
          .accountsPartial({
            sessionToken: sessionToken,
            sessionSigner: sessionWallet?.publicKey!,
            trader: provider.wallet.publicKey,
            config: configPDA,
            mint: existingMint,
            xdegenMint: XdegentMint,
            vault: configAccount.vault,
            traderXdegenAta: walletXdegenAta,
            traderMintAta: buyerMintAta,
            tokenRecord: getTokenRecordPDA(provider.wallet.publicKey, new PublicKey(memeData.data.mint)),
            tokenProgram: TOKEN_PROGRAM_ID,
          }).transaction();

        const txIds = await sessionWallet.signAndSendTransaction!(mintTokenTx);

        if (txIds && txIds.length > 0) {
          console.log("Mint transaction sent:", txIds);
          return txIds[0];
        } else {
          throw new Error("Failed to send buy transaction");
        }
      } else {
        console.log("Buying token initially");
        const newMint = getMintPDA(provider.wallet.publicKey, tokenParams.symbol);
        const userMintAta = await getAssociatedTokenAddress(
          newMint,
          provider.wallet.publicKey
        );

        const buyTx = await program.methods
          .buy(tokenParams, new BN(adjustedBuyAmount))
          .accountsPartial({
            sessionToken: sessionToken,
            sessionSigner: sessionWallet.publicKey!,
            trader: provider.wallet.publicKey,
            config: configPDA,
            vault: getVaultPDA(),
            mint: newMint,
            traderMintAta: userMintAta,
            metadata: getMetadataPDA(newMint),
            xdegenMint: XdegentMint,
            traderXdegenAta: walletXdegenAta,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            tokenMetadataProgram: METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          }).transaction();
          
        const txIds = await sessionWallet.signAndSendTransaction!(buyTx);

        if (txIds && txIds.length > 0) {
          console.log("Buy transaction sent:", txIds);
          
          // Save to supabase
          const { error } = await supabase.from("meme").insert({
            mainMint: tokenParams.mint.toBase58(),
            mint: newMint.toBase58(),
            name: tokenParams.name,
            wallet: provider.wallet.publicKey.toBase58(),
          });

          if (error) {
            console.error("Supabase error:", error);
          }

          return txIds[0];
        } else {
          throw new Error("Failed to send buy transaction");
        }
      }
    },
    onSuccess: async (tx) => {
      toast.success(
        `Buy transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
    },
    onError: (error) => {
      toast.error(`Buy transaction failed: ${error.message}`);
    },
  });

  const sell = useMutation({
    mutationKey: [
      "sell",
      provider?.wallet?.publicKey?.toBase58() || "disconnected",
    ],
    mutationFn: async ({
      mint,
      tokenName,
      tokenSymbol,
      sellAmount,
      burnAmount,
    }: {
      mint: PublicKey;
      tokenName: string;
      tokenSymbol: string;
      sellAmount: number;
      burnAmount: number;
    }) => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      let memeData;
      try {
        console.log(
          "meme record",
          provider.wallet.publicKey.toBase58(),
          mint.toBase58()
        );
        memeData = await supabase
          .from("meme")
          .select()
          .eq("mainMint", mint)
          .eq("name", tokenName)
          .eq("wallet", provider.wallet.publicKey.toBase58())
          .maybeSingle();

        console.log('memeData:', memeData);
      } catch (error) {
        console.error("Error querying meme data:", error);
        throw new Error(
          `Failed to query meme data: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      if (memeData.data == null) {
        throw new Error("Meme data not found for the provided mint and name");
      }

      const xdegenMintInfo = await getMintInfo(XdegentMint);
      if (!xdegenMintInfo) {
        throw new Error(`Mint info not found for mint: ${XdegentMint.toBase58()}`);
      }

      const mintPDA = getMintPDA(provider.wallet.publicKey, tokenSymbol)
      const userMintAta = await getAssociatedTokenAddress(
        mintPDA,
        provider.wallet.publicKey
      );

      const walletXdegenAta = await getAssociatedTokenAddress(
        XdegentMint,
        provider.wallet.publicKey
      );

      const mintInfo = await getMintInfo(mintPDA);
      console.log('mintInfo:', mintInfo);
      const adjustedSellAmount = sellAmount * Math.pow(10, xdegenMintInfo.decimals);
      const adjustedBurnAmount = burnAmount * Math.pow(10, mintInfo.decimals);

      let sessionToken;
      let needsDelegation = false;
      let needsMintDelegation = false; 

      // Create or get existing session
      if (sessionWallet.sessionToken == null) {
        console.log('Creating session and funding with:', 10000000 / LAMPORTS_PER_SOL, 'SOL');
        const session = await sessionWallet.createSession(
          program.programId,
          100000000,
          60
        );
        sessionToken = session?.sessionToken;
        needsDelegation = true;
        needsMintDelegation = true;
      } else {
        sessionToken = sessionWallet?.sessionToken;

        const sessionBalance = await provider.connection.getBalance(sessionWallet.publicKey!);
        if (sessionBalance < 1000) {
          console.log('Funding existing session with:', (10000000 - sessionBalance) / LAMPORTS_PER_SOL, 'SOL');
          const topUpTx = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: provider.wallet.publicKey,
              toPubkey: sessionWallet.publicKey!,
              lamports: 10000000 - sessionBalance,
            })
          );
          await provider.sendAndConfirm(topUpTx);
        }

        // Check if delegation exists for existing session
        const accountInfo = await provider.connection.getAccountInfo(walletXdegenAta);
        if (accountInfo) {
          const accountData = AccountLayout.decode(accountInfo.data);
          const currentDelegate = accountData.delegate ? new PublicKey(accountData.delegate) : null;
          const delegatedAmount = accountData.delegatedAmount;
          
          if (!currentDelegate || 
              !currentDelegate.equals(sessionWallet.publicKey!) || 
              Number(delegatedAmount) < adjustedSellAmount) {
            needsDelegation = true;
          }
        }

        const mintAccountInfo = await getMint(provider.connection, mintPDA);
        if (mintAccountInfo.mintAuthority && !mintAccountInfo.mintAuthority.equals(sessionWallet.publicKey!)) {
          needsMintDelegation = true;
        }
      }

      if (needsDelegation) {
        console.log('Approving session wallet as token delegate...');
        
        // Approve a generous amount (e.g., 1000 tokens or calculate based on expected usage)
        const delegateAmount = Math.max(
          100,
          1000 * Math.pow(10, xdegenMintInfo.decimals) // Or 1000 tokens minimum
        );

        const approveIx = createApproveInstruction(
          walletXdegenAta,
          sessionWallet.publicKey!,
          provider.wallet.publicKey,
          delegateAmount
        );

        const approveTx = new Transaction().add(approveIx);
        
        try {
          const signature = await provider.sendAndConfirm(approveTx);
          console.log('Delegation approved:', signature);
        } catch (error) {
          console.log(error)
          throw new Error(
            `Failed to approve delegation: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      if (needsMintDelegation) {
        console.log('Approving session wallet as mint authority...');
        
        try {
          const wholeBurnAmount = Math.floor(adjustedBurnAmount);
          console.log('Burn amount:', {
            original: adjustedBurnAmount,
            whole: wholeBurnAmount,
            decimals: mintInfo.decimals
          });

          const generousBurnAmount = Math.max(
            wholeBurnAmount * 10,
            1000 * Math.pow(10, mintInfo.decimals)
          );

          const approveMintIx = createApproveInstruction(
            userMintAta,
            sessionWallet.publicKey!,
            provider.wallet.publicKey,
            generousBurnAmount
          );

          const approveMintTx = new Transaction().add(approveMintIx);
          const signature = await provider.sendAndConfirm(approveMintTx);
          console.log('Mint authority delegated:', signature);
        } catch (error) {
          console.error('Mint authority delegation failed:', error);
          throw new Error(
            `Failed to delegate mint authority: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      const configPDA = getConfigPDA();
      const configAccount = await program.account.config.fetch(configPDA);

      const sellTx = await program.methods
        .sell(new BN(adjustedSellAmount), new BN(adjustedBurnAmount))
        .accountsPartial({
          sessionToken: sessionToken,
          sessionSigner: sessionWallet.publicKey!,
          trader: provider.wallet.publicKey,
          config: configPDA,
          vault: configAccount.vault,
          mint: getMintPDA(provider.wallet.publicKey, tokenSymbol),
          traderMintAta: userMintAta,
          xdegenMint: XdegentMint,
          traderXdegenAta: walletXdegenAta,
          tokenRecord: getTokenRecordPDA(provider.wallet.publicKey, new PublicKey(memeData.data.mint)),
          tokenProgram: TOKEN_PROGRAM_ID,
        }).transaction();

      const txIds = await sessionWallet.signAndSendTransaction!(sellTx);
      if (txIds && txIds.length > 0) {
        console.log("Sell transaction sent:", txIds);
        return txIds[0];
      } else {
        throw new Error("Failed to send sell transaction");
      }
    },
    onSuccess: async (tx) => {
      toast.success(
        `Sell transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
    },
    onError: (error) => {
      toast.error(`Sell transaction failed: ${error.message}`);
    },
  });

  const withdraw = useMutation({
    mutationKey: ["withdraw"],
    mutationFn: async (amount: number) => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to use trading features."
        );
      }

      const configAccount = await program.account.config.fetch(getConfigPDA());
      const mintInfo = await getMintInfo(XdegentMint);
      const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

      const adminXdegenAta = await getAssociatedTokenAddress(
        XdegentMint,
        configAccount.admin
      );

      const transaction = new Transaction();
      const withdrawTx = await program.methods
        .withdraw(new BN(adjustedAmount))
        .accountsPartial({
          admin: configAccount.admin,
          config: getConfigPDA(),
          xdegenMint: XdegentMint,
          vault: configAccount.vault,
          adminXdegenAta: adminXdegenAta,
        })
        .instruction();

      transaction.add(withdrawTx);
      transaction.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = provider.wallet.publicKey;

      // Sign and send transaction
      const signedTransaction = await provider.wallet.signTransaction(
        transaction
      );
      const txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await provider.connection.confirmTransaction(txId);
      return txId;
    },
    onSuccess: async (tx) => {
      toast.success(
        `Withdraw transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
    },
    onError: (error) => {
      toast.error(`Withdraw transaction failed: ${error.message}`);
    },
  });

  const claim = useMutation({
    mutationKey: [
      "claim",
      provider?.wallet?.publicKey?.toBase58() || "disconnected",
    ],
    mutationFn: async () => {
      if (!provider || !provider.wallet?.publicKey || !program) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to claim."
        );
      }

      const configAccount = await program.account.config.fetch(getConfigPDA());
      const userXdegenAtaOrInstruction = await getOrCreateTokenAccount(
        provider,
        XdegentMint,
        provider.wallet.publicKey
      );

      // Build transaction with potential ATA creation + claim
      const transaction = new Transaction();

      let userXdegenAta: PublicKey;
      if (userXdegenAtaOrInstruction instanceof PublicKey) {
        // ATA already exists, just use the address
        userXdegenAta = userXdegenAtaOrInstruction;
      } else {
        // ATA needs to be created, add creation instruction to transaction
        transaction.add(userXdegenAtaOrInstruction);
        userXdegenAta = await getAssociatedTokenAddress(
          XdegentMint,
          provider.wallet.publicKey
        );
      }

      // Add claim instruction to the same transaction
      const claimTx = await program.methods
        .claim()
        .accountsPartial({
          claimer: provider.wallet.publicKey,
          config: getConfigPDA(),
          xdegenMint: XdegentMint,
          vault: configAccount.vault,
          claimerXdegenAta: userXdegenAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction();

      transaction.add(claimTx);
      transaction.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = provider.wallet.publicKey;

      // Sign and send transaction
      const signedTransaction = await provider.wallet.signTransaction(
        transaction
      );
      const txId = await provider.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await provider.connection.confirmTransaction(txId);

      return txId;
    },
    onSuccess: async (tx) => {
      toast.success(
        `Claim transaction successful\nhttps://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
    },
    onError: (error) => {
      toast.error(`Claim transaction failed: ${error.message}`);
    },
  });

  const getConfigPDA = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      programId
    )[0];
  };

  const getMetadataPDA = (mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    )[0];
  };

  const getVaultPDA = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), XdegentMint.toBuffer()],
      programId
    )[0];
  };

  // Improved helper function to get or create associated token account
  // Returns either a transaction instruction (if ATA needs to be created) or the ATA address (if it already exists)
  async function getOrCreateTokenAccount(
    provider: AnchorProvider,
    mint: PublicKey,
    owner: PublicKey
  ) {
    try {
      const walletATA = await getAssociatedTokenAddress(mint, owner);

      if (!(await provider.connection.getAccountInfo(walletATA))) {
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to process token account for mint ${mint.toBase58()}: ${errorMessage}`
      );
    }
  }

  return {
    initialize,
    deposit,
    buy,
    sell,
    withdraw,
    claim,
  };
};
