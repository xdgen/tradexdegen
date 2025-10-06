import React, { useMemo } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletBar } from "./walletBar";
import { Link, useLocation } from "react-router-dom";
import CommunityRegisterDialog from "../communityRegisterDialog";

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const isCommunityActive = useMemo(
    () => pathname.includes("explorer"),
    [pathname]
  );

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
        <Link
          to="/call"
          className="py-2 px-6 rounded-md text-white flex items-center gap-2 font-thin cursor-pointer border border-primary/10 bg-primary/10 hover:bg-primary/20 hover:text-white/100 transition-all duration-300 shadow-md hover:shadow-primary/30"
        >
          Live Call
        </Link>
        <WalletBar />
      </div>
    </nav>
  );
};

export default Navbar;
