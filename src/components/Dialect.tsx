import "@dialectlabs/react-ui/index.css";

import {
  DialectSolanaSdk,
  Environment,
} from "@dialectlabs/react-sdk-blockchain-solana";
import {
  Icons,
  NotificationsButton,
  NotificationTypeStyles,
} from "@dialectlabs/react-ui";
import { Dialect, DialectCloudEnvironment, DialectSdk } from "@dialectlabs/sdk";
// import {
//   Solana,
//   SolanaSdkFactory,
//   NodeDialectSolanaWalletAdapter,
// } from "@dialectlabs/blockchain-sdk-solana";
// import { Keypair } from "@solana/web3.js";
// import bs58 from "bs58";

// const base58Key =
//   "4YtNuvqHyc9L9dTqgRzZzj7o68HPLP2s4FxZVbuzS5YTZ3GdCdpD2wZ8Ab8QZoKwnfd7d2Aah7rP4CzTbB68bYUp";

// // Decode to Uint8Array
// const secretKey = bs58.decode(base58Key);

// // Convert to array format
// const keyArray = Array.from(secretKey);
// console.log(JSON.stringify(keyArray), "Keypair");

const DAPP_ADDRESS: DialectCloudEnvironment =
  import.meta.env.VITE_DIALECT_DAPP_ADDRESS ??
  "UK7UjLY4zfQKBLv2hsbZG1oFxQYgDcQPhFPz5SUKJBS";
const environment = import.meta.env.VITE_PUBLIC_ENVIRONMENT ?? "production";
console.log(import.meta.env.VITE_DIALECT_SDK_CREDENTIALS);

// const dialectSolanaSDK: DialectSdk<Solana> = Dialect.sdk(
//   {
//     environment,
//   },
//   SolanaSdkFactory.create({
//     wallet: NodeDialectSolanaWalletAdapter.create(
//       import.meta.env.VITE_DIALECT_SDK_CREDENTIALS
//     ),
//   })
// );

// const dapp = await dialectSolanaSDK.dapps.find();
// console.log(dapp, "DAPP");

NotificationTypeStyles.offer_outid = {
  Icon: <Icons.Bell width={12} height={12} />,
  iconColor: "#FFFFFF",
  iconBackgroundColor: "#FF0000",
  iconBackgroundBackdropColor: "#FF00001A",
  linkColor: "#FF0000",
  actionGradientStartColor: "#FF00001A",
};

export const DialectSolanaNotificationsButton = () => {
  return (
    <DialectSolanaSdk
      dappAddress={DAPP_ADDRESS}
      config={{
        environment,
      }}
    >
      <NotificationsButton theme="dark" channels={["telegram"]} />
    </DialectSolanaSdk>
  );
};
