import React from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletBar } from './walletBar'

const Navbar: React.FC = () => {


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
                <ConnectButton />
                <WalletBar />
            </div>
        </nav>
    );
};

export default Navbar;
