import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { AnchorProvider, setProvider } from '@coral-xyz/anchor'

export const useAnchor = () => {
    const wallet = useAnchorWallet();
    const { connection } = useConnection()

    if (!wallet) {
        return null;
    }

    const provider = new AnchorProvider(connection, wallet);
    setProvider(provider);
    return provider;
}