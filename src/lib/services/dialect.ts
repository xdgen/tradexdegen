import "@dialectlabs/react-ui/index.css";

import { Dialect, DialectCloudEnvironment, DialectSdk } from "@dialectlabs/sdk";
import {
  Solana,
  SolanaSdkFactory,
  NodeDialectSolanaWalletAdapter,
} from "@dialectlabs/blockchain-sdk-solana";
import { toast } from "sonner";

import { decodeBase58Key } from "./solana";

const base58Key = import.meta.env.VITE_APP_WALLET_PRIVATE_KEY;
const keypair = decodeBase58Key(base58Key);

const DAPP_ADDRESS: DialectCloudEnvironment =
  import.meta.env.VITE_DIALECT_DAPP_ADDRESS ??
  "2nwjR37ZNUUD78rESvGXXV9QnMMBTDGQLTBKiBxepEdg";
const environment = import.meta.env.VITE_PUBLIC_ENVIRONMENT ?? "production";

const dialectSolanaSDK: DialectSdk<Solana> = Dialect.sdk(
  {
    environment,
  },
  SolanaSdkFactory.create({
    wallet: NodeDialectSolanaWalletAdapter.create(keypair),
  })
);

// Initialize dapp asynchronously
let dapp: any = null;

const initializeDapp = async () => {
  try {
    dapp = await dialectSolanaSDK.dapps.find();
    if (!dapp) {
      toast.error("Dapp not found. Please register your app first.");
    }
  } catch (error) {
    console.error("Failed to initialize Dialect dapp:", error);
    toast.error("Failed to initialize Dialect dapp");
  }
};

// Initialize immediately
initializeDapp();

export {
  keypair,
  DAPP_ADDRESS,
  dapp,
  environment,
  dialectSolanaSDK,
  initializeDapp,
};
