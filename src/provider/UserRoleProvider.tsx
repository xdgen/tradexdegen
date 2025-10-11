import { useWallet } from "@solana/wallet-adapter-react";
import React, {
  useContext,
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";

interface IUserRoleContext {
  isCheckingUserRole: boolean;
  isRoleDialogOpen: boolean;
  closeDialog: () => void;
  role: Role | null;
  updateUserRole: (role: Role) => void;
  isAuthenticated: boolean;
}

interface IUserRoleProvider {
  children: React.ReactNode;
}

const UserRoleContext = createContext<IUserRoleContext | undefined>(undefined);

export const UserRoleProvider = ({ children }: IUserRoleProvider) => {
  const [isCheckingUserRole, setIsCheckingUserRole] = useState(false);
  const { publicKey, connected } = useWallet();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const roleRef = useRef<Role | null>(null);
  const isAuthenticated = useMemo(
    () => (connected && publicKey && role ? true : false),
    [connected, publicKey, role]
  );

  const loadUserRole = useCallback(() => {
    if (!connected || !publicKey) {
      setRole(null);
      return;
    }

    const saved = localStorage.getItem(`userRole:${publicKey.toString()}`);
    if (saved) {
      roleRef.current = saved as Role;
      setRole(saved as Role);
    }
  }, [connected, publicKey]);

  const updateUserRole = (newRole: Role) => {
    if (!publicKey || !newRole) return;

    localStorage.setItem(`userRole:${publicKey.toString()}`, newRole);
    setRole(newRole);
    roleRef.current = newRole;
  };

  const checkIfWalletExist = useCallback(async () => {
    if (!connected || !publicKey) return;

    if (roleRef.current) return;

    try {
      setIsCheckingUserRole(true);

      // Simulate an async operation, e.g., fetching data from an API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would typically check if the wallet exists in your backend
      const response = null;

      if (response) {
        // Set role from API Response and
        updateUserRole(response);
      } else {
        setIsRoleDialogOpen(true);
      }
    } catch (err) {
      console.log("Error checking wallet: ", err);
      setIsRoleDialogOpen(true);
    } finally {
      setIsCheckingUserRole(false);
    }
  }, [publicKey, connected]);

  useEffect(() => {
    loadUserRole();
  }, [loadUserRole]);

  useEffect(() => {
    if (connected && publicKey && !role) {
      checkIfWalletExist();
    }
  }, [checkIfWalletExist]);

  const closeDialog = () => {
    setIsRoleDialogOpen((prevProp) => !prevProp);
  };

  return (
    <UserRoleContext.Provider
      value={{
        isCheckingUserRole,
        isRoleDialogOpen,
        closeDialog,
        isAuthenticated,
        role,
        updateUserRole,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useCheckUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useCheckUserRole must be used within a UserRoleProvider");
  }
  return context;
};
