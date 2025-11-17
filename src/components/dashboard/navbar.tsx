import React, { useMemo } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletBar } from "./walletBar";
import CommunityRegisterDialog from "../dialogs/communityRegisterDialog";
import { DialectSolanaNotificationsButton } from "../Dialect";
import { useAuth } from "../../provider/AuthProvider";
import useLocalStorageSubscription from "../../hooks/useLocalStorageSubscription";
import { Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

const Navbar: React.FC = () => {
  const { connected } = useWallet();
  const { role, authData, isCheckingUserRole } = useAuth();
  const [academyCreated] = useLocalStorageSubscription(
    `academy-${authData?.user.id}`
  );

  const isAcademy = useMemo(() => {
    if (!role || !connected) null;

    return role === "ACADEMY";
  }, [role, connected]);

  return (
    <nav className="text-white w-full flex items-center justify-between p-4 shadow-md bg-secondary border-b border-gray-100/10">
      {/* Left section with profile and language */}
      <div className="flex items-center">
        <div className="flex items-center bg-secondary rounded-full px-4 py-2 w-full">
          <p>Xperience degen</p>
        </div>
      </div>

      {/* Right section with settings and notification */}
      <div className="flex gap-4 items-center">
        {/* Hide if academy is registered */}
        {isAcademy && !academyCreated && <CommunityRegisterDialog />}
        {isCheckingUserRole && <Loader2 className="animate-spin w-6" />}
        <WalletMultiButton
          style={{
            margin: "1px 0",
            padding: "2px 15px",
            borderRadius: "20px",
            backgroundColor: "#0E0E0F",
            fontSize: "14px",
            color: "white",
            border: "1px solid rgba(42, 96, 58, 0.57)",
          }}
        />
        <WalletBar />
        <DialectSolanaNotificationsButton />
      </div>
    </nav>
  );
};

export default Navbar;
