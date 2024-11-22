import React from "react";
import SearchIcon from '@mui/icons-material/Search';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
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
                <div className='border border-gray-700/40 rounded-full px-4 flex items-center hover:border-primary transition-all duration-300 ease-in-out'>
                    <WalletMultiButton
                        style={{
                            margin: '1px 0',
                            padding: '0',
                            borderRadius: '0',
                            backgroundColor: '#0E0E0F',
                            fontSize: '14px',
                            color: 'white',
                        }}
                    />
                </div>
                <WalletBar />
            </div>
        </nav>
    );
};

export default Navbar;
