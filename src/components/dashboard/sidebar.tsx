import { cn } from "../../lib/utils";
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import SchoolIcon from '@mui/icons-material/School';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import React from "react";
import { useNavigate, useLocation } from 'react-router-dom'; // For routing

import CompassCalibrationIcon from '@mui/icons-material/CompassCalibration';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import WifiFindIcon from '@mui/icons-material/WifiFind';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';
import SensorOccupiedIcon from '@mui/icons-material/SensorOccupied';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();  // To programmatically navigate
  const location = useLocation();  // To get the current pathname

  // Define routes
  const routes = [
    {
      icon: CompassCalibrationIcon,
      href: "/dashboard/newpairs",
      label: "New Pairs",
      pro: false,
    },
    {
      icon: AnalyticsIcon,
      href: "/analytics",
      label: "Analytics",
      pro: true,
    },
    {
      icon: ManageAccountsIcon,
      href: "/manage",
      label: "Manage",
      pro: true,
    },
    {
      icon: LocalAtmIcon,
      href: "/createfund",
      label: "Create Fund",
      pro: true,
    },
    {
      icon: WifiFindIcon,
      href: "/discover",
      label: "Discover",
      pro: false,
    },
    {
      icon: SwapHorizIcon,
      href: "/swap",
      label: "Swap",
      pro: false,
    },
  ];
  const footerRoutes = [
    {
      icon: SettingsIcon,
      href: "/settings ",
      label: "Settings ",
      pro: false,
    },
    {
      icon: FolderIcon,
      href: "/docs",
      label: "Docs",
      pro: true,
    },
    {
      icon: SensorOccupiedIcon,
      href: "/nFTs",
      label: "NFTs",
      pro: true,
    },

  ];

  // Function to handle navigation
  const onNavigate = (url: string, pro: boolean) => {
    // Optional: Handle 'pro' check or authentication logic
    navigate(url);  // Navigate to the new URL
  };

  return (
    <div className="bg-background">
      <div className="w-60 py-10">
        <div className="space-y-2">
          <div className='w-24 pl-6 mb-10'>
            <img src='/images/logo.svg' alt="logo" className="w-full h-full" />
          </div>
          {routes.map((route) => (
            <div
              key={route.href} // Ensure each item has a unique key
              onClick={() => onNavigate(route.href, route.pro)}
              className={cn(
                "text-white/60 text-sm group p-3 w-full cursor-pointer hover:text-white hover:bg-secondary transition font-medium",
                location.pathname === route.href && "bg-secondary text-white border-r-4 border-primary" // Apply active class based on current route
              )}
            >
              <div className="flex flex-row gap-y-2 justify-start items-center flex-1 w-full gap-2">
                <route.icon className="h-5 w-5" /> {/* Render the icon */}
                {route.label} {/* Render the label */}
              </div>
            </div>
          ))}
          <div className="py-4 border-t border-white/10">
            {footerRoutes.map((ftroute) => (
              <div
                key={ftroute.href} // Ensure each item has a unique key
                onClick={() => onNavigate(ftroute.href, ftroute.pro)}
                className={cn(
                  "text-white/60 text-sm group p-3 w-full cursor-pointer hover:text-white hover:bg-secondary transition font-medium",
                  location.pathname === ftroute.href && "bg-secondary text-white border-r-4 border-primary" // Apply active class based on current route
                )}
              >
                <div className="flex flex-row gap-y-2 justify-start items-center flex-1 w-full gap-2">
                  <ftroute.icon className="h-5 w-5" /> {/* Render the icon */}
                  {ftroute.label} {/* Render the label */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
