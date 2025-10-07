import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Connection,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export const sendSol = async (
  wallet: WalletContextState,
  connection: Connection,
  recipientAddress: string,
  amountSol: number
) => {
  if (!wallet.connected || !wallet.publicKey)
    throw new Error("Wallet not connected");

  const recipient = new PublicKey(recipientAddress);
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
  console.log(lamports, "lamports to send", amountSol, "SOL");

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports,
    })
  );

  try {
    // Request Signature and Send
    const signature = await wallet.sendTransaction(tx, connection);

    // Confirm transaction
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  } catch (err: any) {
    console.log("Payment failed:", err?.response);
    throw new Error(err?.message || "Transaction Failed");
  }
};
