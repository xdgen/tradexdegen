import { cn } from "../../lib/utils";
import React from "react";
import { useNavigate, useLocation } from 'react-router-dom'; // For routing

import CompassCalibrationIcon from '@mui/icons-material/CompassCalibration';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FolderIcon from '@mui/icons-material/Folder';
const Sidebar: React.FC = () => {
  const navigate = useNavigate(); // To programmatically navigate
  const location = useLocation(); // To get the current pathname

  // Define routes
  // const routes = [
  //   {
  //     icon: CompassCalibrationIcon,
  //     href: "/home",
  //     label: "Home",
  //     pro: false,
  //   },
  //   {
  //     icon: AnalyticsIcon,
  //     href: "/funds",
  //     label: "Set balance",
  //     pro: true,
  //   },
  //   {
  //     icon: ManageAccountsIcon,
  //     href: "/trade",
  //     label: "Trade",
  //     pro: true,
  //   },
  //   {
  //     icon: LocalAtmIcon,
  //     href: "/coming",
  //     label: "Analysis",
  //     pro: true,
  //   },
  //   {
  //     icon: MonetizationOnIcon,
  //     href: "/pnl",
  //     label: "Pnl",
  //     pro: true,
  //   },

  //   {
  //     icon: SettingsIcon,
  //     href: "/settings",
  //     label: "Settings ",
  //     pro: false,
  //   },
  //   {
  //     icon: FolderIcon,
  //     href: "https://xdegen.gitbook.io/docs",
  //     label: "Docs",
  //     pro: true,
  //   },
  // ];

  // Function to handle navigation
  // const onNavigate = (url: string, pro: boolean) => {
  //   // Optional: Handle 'pro' check or authentication logic
  //   navigate(url);  // Navigate to the new URL
  // };

  // Define the route type
  type Route = {
    icon: React.ElementType;
    href: string;
    label: string;
    pro: boolean;
    external?: boolean; // Optional external flag
  };

  // Define routes using the new type
  const routes: Route[] = [
    {
      icon: CompassCalibrationIcon,
      href: "/home",
      label: "Home",
      pro: false,
    },
    {
      icon: AnalyticsIcon,
      href: "/funds",
      label: "Set balance",
      pro: true,
    },
    {
      icon: ManageAccountsIcon,
      href: "/trade",
      label: "Trade",
      pro: true,
    },
    {
      icon: LocalAtmIcon,
      href: "/coming",
      label: "Analysis",
      pro: true,
    },
    {
      icon: MonetizationOnIcon,
      href: "/pnl",
      label: "Pnl",
      pro: true,
    },
    {
      icon: SettingsIcon,
      href: "/settings",
      label: "Settings",
      pro: false,
    },
    {
      icon: FolderIcon,
      href: "https://xdegen.gitbook.io/docs", // External link
      label: "Docs",
      pro: true,
      external: true, // This is now recognized as valid
    },
  ];

  // Function to handle navigation
  const onNavigate = (url: string, pro: boolean, external?: boolean) => {
    if (external) {
      window.open(url, "_blank", "noopener noreferrer"); // Open external links in a new tab
    } else {
      navigate(url); // Navigate internally
    }
  };

  
  return (
    <div className="bg-background">
      <div className="w-60 py-10">
        <div className="space-y-2">
          <div className="w-28 pl-4 mb-10">
            <a href="/" className="">
              <img src="/images/gen.svg" alt="logo" className="w-full h-full" />
            </a>
          </div>
          {routes.map((route) => (
            <div
              key={route.href}
              onClick={() => onNavigate(route.href, route.pro, route.external)}
              className={cn(
                "text-white/60 text-sm group p-3 w-full cursor-pointer hover:text-white hover:bg-secondary transition font-medium",
                location.pathname === route.href &&
                  !route.external &&
                  "bg-secondary text-white border-r-4 border-primary"
              )}
            >
              <div className="flex flex-row gap-y-2 justify-start items-center flex-1 w-full gap-2">
                <route.icon className="h-5 w-5" />
                {route.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
