import {
    useSessionKeyManager,
    SessionWalletProvider
} from "@magicblock-labs/gum-react-sdk";
import { 
    AnchorWallet, 
    useAnchorWallet, 
    useConnection 
} from "@solana/wallet-adapter-react";
import React from "react";

const SessionProvider = ({ children }: { children: React.ReactNode}) => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  const cluster = "devnet";
  const sessionWallet = useSessionKeyManager(anchorWallet, connection, cluster);

  return (
    <SessionWalletProvider sessionWallet={sessionWallet}>
      {children}
    </SessionWalletProvider>
  )
};

export default SessionProvider;