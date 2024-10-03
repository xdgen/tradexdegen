import React, { FC, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProps {
    children: React.ReactNode;
}

const SolanaWalletProvider: FC<SolanaWalletProps> = ({ children }) => {
    // Network configuration
    const network = WalletAdapterNetwork.Devnet; // Use Devnet for testing, switch to Mainnet when needed.

    // Solana endpoint to connect
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // Available wallets for Solana
    const wallets = useMemo(
        () => [
            new SolflareWalletAdapter(),  // Include Solflare Wallet
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default SolanaWalletProvider;
