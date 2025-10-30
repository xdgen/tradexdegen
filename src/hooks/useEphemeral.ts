import { AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

const useEphemeral = () => {
    const wallet = useAnchorWallet();

    if (!wallet) {
        return null;
    }

    const provider = new AnchorProvider(
        new Connection("https://devnet-as.magicblock.app/",
        {
            wsEndpoint: "wss://devnet-as.magicblock.app/",
            commitment: 'confirmed'
        }),
        wallet
    );
    setProvider(provider);
    return provider;
}

export default useEphemeral;