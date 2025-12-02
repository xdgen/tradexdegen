import { AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

const useEphemeral = () => {
    const wallet = useAnchorWallet();

    if (!wallet) {
        return null;
    }

    const provider = new AnchorProvider(
        new Connection(
            "https://devnet.magicblock.app/",
            { wsEndpoint: "wss://devnet.magicblock.app/" }
        ),
        wallet
    );
    setProvider(provider);
    return provider;
}

export default useEphemeral;