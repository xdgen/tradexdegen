import React, { Suspense } from "react";
import Sidebar from "./sidebar";

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className="h-auto w-full flex flex-row">
        <div className="hidden md:flex h-full fixed z-50">
          <Sidebar />
        </div>
        <main className="overflow-y-auto md:pl-60 relative w-full">
          <Suspense fallback={'Loading'}>
            <div className="">{children}</div>
          </Suspense>
        </main>
    </div>
  );
};

export default RootLayout;
