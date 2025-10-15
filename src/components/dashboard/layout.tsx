import React, { Suspense } from "react";
import Sidebar from "./sidebar";
import { UserRoleProvider } from "../../provider/UserRoleProvider";
import { ChatProvider } from "../../provider/ChatProvider";
import { ChatWidget } from "../chat/chatWidget";

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <UserRoleProvider>
      <ChatProvider>
        <div className="h-auto w-full flex flex-row">
          <div className="hidden md:flex h-full fixed z-50">
            <Sidebar />
          </div>
          <main className="overflow-y-auto md:pl-60 relative w-full">
            <Suspense fallback={"Loading"}>
              <div className="">{children}</div>
            </Suspense>
          </main>
        </div>

        <ChatWidget />
      </ChatProvider>
    </UserRoleProvider>
  );
};

export default RootLayout;
