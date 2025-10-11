import "@dialectlabs/react-ui/index.css";

import { DialectSolanaSdk } from "@dialectlabs/react-sdk-blockchain-solana";
import {
  Icons,
  NotificationsButton,
  NotificationTypeStyles,
} from "@dialectlabs/react-ui";
import { DAPP_ADDRESS, environment } from "../lib/services/dialect";

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
