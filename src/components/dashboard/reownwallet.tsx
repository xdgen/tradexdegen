import { createAppKit, useAppKitAccount } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";

// Initialize Supabase client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and anon key must be provided.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const projectId = import.meta.env.VITE_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("Project Id is not defined.");
}

// 2. Create a metadata object - optional
const metadata = {
  name: "Xdegen",
  description: "Master crypto trading with confidence",
  url: "https://xdegen.xyz", // origin must match your domain & subdomain
  icons: ["https://imgur.com/a/oktpbml"],
};

// 3. Create modal
createAppKit({
  adapters: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new SolanaAdapter(),
  ],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId: projectId as string,
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
  themeMode: "dark",
});

const AppKit = () => {
  const { address, isConnected, status } = useAppKitAccount();

  useEffect(() => {
    const addWalletToSupabase = async () => {
      if (isConnected && address) {
        console.log("Wallet to be sent to Supabase:", address);
        try {
          // Insert wallet address into Supabase table
          const { data, error } = await supabase
            .from('wallets')
            .insert([{ address }]);

          if (error) {
            console.error(
              "Error inserting wallet into Supabase:",
              error.message
            );
          } else {
            console.log("Wallet successfully added to Supabase:", data);
          }
        } catch (err) {
          console.error("Error during wallet connection:", err);
        }
      }
    };

    addWalletToSupabase();
  }, [isConnected, address]);

  return (
    <div>
      <appkit-button />
      {/* {status === "connected" && <p>Connected wallet: {address}</p>} */}
    </div>
  );
};

export default AppKit;
