import React from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Navbar: React.FC = () => {
    return (
        <nav className="text-white w-full flex items-center justify-between p-4 shadow-md">
            {/* Left section with profile and language */}
            <div className="flex items-center space-x-4">
                {/* Profile section */}
                <div className="flex items-center space-x-2">
                    <img
                        src="https://via.placeholder.com/30"
                        alt="Profile"
                        className="rounded-full h-8 w-8"
                    />
                </div>
                    <div className="rounded-full bg-secondary hover:bg-gray-500/50 transition-all py-2 px-4">
                        <span className="text-sm font-semibold">EN</span>
                        <ExpandMoreIcon />
                    </div>
            </div>

            {/* Right section with settings and notification */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center bg-secondary rounded-full px-4 py-2 w-full">
                    <SearchIcon className="text-gray-400 mr-2 text-sm" />
                    <input
                        type="text"
                        placeholder="Search by token or pair..."
                        className="bg-transparent focus:outline-none w-full text-white"
                    />
                </div>
                {/* Settings button */}
                <div className="rounded-full bg-secondary hover:bg-gray-500/50 transition-all p-2">
                    <TuneIcon />
                </div>

                {/* Notification */}
                <div className="relative rounded-full bg-secondary hover:bg-gray-500/50 transition-all p-2">
                    <NotificationsIcon />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
