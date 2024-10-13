import React from "react";
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar: React.FC = () => {
    return (
        <nav className="text-white w-full flex items-center justify-between p-4 shadow-md bg-secondary border-b border-gray-100/10">
            {/* Left section with profile and language */}
            <div className="flex items-center">
                <div className="flex items-center bg-secondary rounded-full px-4 py-2 w-full">
                    <SearchIcon className="text-gray-400 mr-2 text-sm" />
                    <input
                        type="text"
                        placeholder="Search by token or pair..."
                        className="bg-transparent focus:outline-none w-full text-white"
                    />
                </div>
            </div>

            {/* Right section with settings and notification */}
            <div className="flex gap-4 items-center">


                {/* Settings button */}
                <div className="rounded-full bg-secondary hover:bg-gray-500/50 transition-all p-2">
                    <TuneIcon />
                </div>

                {/* Notification */}
                {/* <div className="relative rounded-full bg-secondary hover:bg-gray-500/50 transition-all p-2">
                    <NotificationsIcon />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </div> */}
                <div>
                    <WalletMultiButton style={{ padding: '10px 20px', borderRadius: '8px' }} />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
