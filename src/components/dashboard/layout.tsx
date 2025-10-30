import React, { Suspense } from "react";
import Sidebar from "./sidebar";
import { useAuth } from "../../provider/AuthProvider";
import { ChatProvider } from "../../provider/ChatProvider";
import { ChatWidget } from "../chat/chatWidget";
import SetUserRoleDialog from "../dialogs/setUserRoleDialog";
import StudentAcademyRegisterDialog from "../dialogs/studentAcademyRegistrationDialog";

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const {
    isRoleDialogOpen,
    closeRoleDialog,
    isStudentDialogOpen,
    closeStudentDialog,
  } = useAuth();

  return (
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

      {/* User Role Form */}
      <SetUserRoleDialog
        isOpen={isRoleDialogOpen}
        closeDialog={closeRoleDialog}
      />

      <StudentAcademyRegisterDialog
        isOpen={isStudentDialogOpen}
        closeDialog={closeStudentDialog}
      />
    </ChatProvider>
  );
};

export default RootLayout;
