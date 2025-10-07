import React, { useMemo } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletBar } from "./walletBar";
import { useLocation } from "react-router-dom";
import CommunityRegisterDialog from "../dialogs/communityRegisterDialog";
import { useCheckUserRole } from "../../hooks/forms/useUserRole";

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { role } = useCheckUserRole();
  const isCommunityActive = useMemo(
    () => pathname.includes("explorer"),
    [pathname]
  );
  console.log(role);

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
        {isCommunityActive && <CommunityRegisterDialog />}
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
      </div>
    </nav>
  );
};

export default Navbar;
