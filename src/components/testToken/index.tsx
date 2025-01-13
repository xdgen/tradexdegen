import { Connection, Keypair, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
    window.Buffer = Buffer;
}
const network = "https://devnet.helius-rpc.com/?api-key=38caa145-8a0a-4499-a141-be31c8f4c784";
const connection = new Connection(network, 'confirmed');

export const SolToken = async (walletAddress: string) => {
    try {

        // Validate the wallet address
        const recipient = new PublicKey(walletAddress);

        // Request an airdrop
        const signature = await connection.requestAirdrop(
            recipient,
            LAMPORTS_PER_SOL
        );

        // Confirm the transaction
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');

        if (confirmation.value.err) {
            throw new Error('Failed to Airdrop');
        }
        // Respond with success
        return { message: "success" };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { message: error.message || "failed" };
        } else {
            return { message: "failed" };
        }
    }
}

export const claimXSOL = async (
publicKey: PublicKey, amount: number,
    
) => {
    try {
        // console.log(process.env.NEXT_PUBLIC_CONNECTION)
        const amount = 5;
        const source_wallet = new PublicKey('XdEqt8TDiG6HHxTCdo41FWwxt7qpthK5VWcXQWjthbS');

        const mint = '3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce';
        const mint_address = new PublicKey(mint);

        if (!publicKey) {
            alert('Please connect your wallet!');
            return;
        }

        const sourceAccountAta = await getAssociatedTokenAddress(mint_address, source_wallet);
        const destinationAccountAta = await getAssociatedTokenAddress(mint_address, publicKey);

        // Check if the ATAs already exist
        const sourceAccount = await connection.getAccountInfo(sourceAccountAta);
        const destinationAccount = await connection.getAccountInfo(destinationAccountAta);

        const checkDecimals = await connection.getParsedAccountInfo(new PublicKey(mint));
        if (!checkDecimals.value) {
            throw new Error('Token account not found');
        }
        const numberDecimals = (checkDecimals.value.data as ParsedAccountData).parsed.info.decimals as number

        // Create the transfer instruction
        const transferInstruction = createTransferInstruction(
            sourceAccountAta,
            destinationAccountAta,
            source_wallet,  // owner of the source token account
            Math.floor(Number(amount) * Math.pow(10, numberDecimals))  // amount in smallest units (e.g., lamports for SOL)
        );

        // Create a transaction and add the transfer instruction
        const transaction = new Transaction()

        if (!sourceAccount) {
            transaction.add(createAssociatedTokenAccountInstruction(
                source_wallet,
                sourceAccountAta,
                source_wallet,
                mint_address
            ));
        }

        if (!destinationAccount) {
            transaction.add(createAssociatedTokenAccountInstruction(
                source_wallet,
                destinationAccountAta,
                publicKey,
                mint_address
            ));
        }
        transaction.add(transferInstruction);

        transaction.feePayer = source_wallet;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        // Assuming you have the source wallet's keypair
        const sourceWalletKeypairString = "[209,174,191,23,162,17,90,120,119,10,162,129,102,112,254,55,34,0,251,151,0,136,148,17,139,179,182,35,175,245,175,98,7,216,102,67,96,114,252,224,248,112,137,241,50,183,197,158,137,134,177,28,46,169,248,74,87,68,83,145,107,153,146,229]";
        if (!sourceWalletKeypairString) {
            throw new Error('Source wallet keypair not found');
        }
        const sourceWalletKeypair = Keypair.fromSecretKey(
            Uint8Array.from(JSON.parse(sourceWalletKeypairString))
        );
        transaction.sign(sourceWalletKeypair);

        const txid = await connection.sendRawTransaction(transaction.serialize());
        const msg = `Transaction sent: ${txid}`;
        return { message: msg };


    } catch (error) {
        console.error('Transaction error:', error);
        throw error;
    }
}