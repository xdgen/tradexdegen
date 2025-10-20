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
import { axios } from "../lib/axios";
import { toast } from "sonner";

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
  const [authData, setAuthData] = useState<AuthResponse | null>(null);

  const roleRef = useRef<Role | null>(null);
  const isAuthenticated = useMemo(
    () => (connected && publicKey && role ? true : false),
    [connected, publicKey, role]
  );

  console.log(authData);

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

  const updateAuthData = (data: AuthResponse) => {
    setAuthData({
      token: {
        ...data.token,
        accessTokenExpiresAt: new Date(data.token.accessTokenExpiresAt),
        refreshTokenExpiresAt: new Date(data.token.refreshTokenExpiresAt),
      },
      user: {
        ...data.user,
        created_at: new Date(data.user.created_at),
        updated_at: new Date(data.user.updated_at),
      },
    });

    localStorage.setItem("authData", JSON.stringify(data));
  };

  // Update User Role
  const updateUserRole = async (newRole: Role) => {
    if (!publicKey || !newRole) return;

    try {
      const response = await axios.post("/auth/register", {
        wallet: publicKey,
        role: newRole.toUpperCase(),
      });
      const data = response.data as AuthResponse;

      updateAuthData(data);
      toast.success("User successfully registered");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Unknown error occurred";
      toast.error(message);
    }
  };

  const checkIfWalletExist = useCallback(async () => {
    if (!connected || !publicKey) return;

    if (roleRef.current) return;

    try {
      setIsCheckingUserRole(true);

      const response = await axios(`/auth/check-wallet/${publicKey}`);
      const data = response.data as CheckUserResponse;

      if (!data.status) {
        setIsRoleDialogOpen(true);
      }
    } catch (err) {
      setIsRoleDialogOpen(true);
    } finally {
      setIsCheckingUserRole(false);
    }
  }, [publicKey, connected]);

  useEffect(() => {
    const storedAuth = localStorage.getItem("authData");

    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setAuthData({
          token: {
            ...parsed.token,
            accessTokenExpiresAt: new Date(parsed.token.accessTokenExpiresAt),
            refreshTokenExpiresAt: new Date(parsed.token.refreshTokenExpiresAt),
          },
          user: {
            ...parsed.user,
            created_at: new Date(parsed.user.created_at),
            updated_at: new Date(parsed.user.updated_at),
          },
        });
      } catch (err) {
        console.error("Failed to parse auth data:", err);
      }
    }
  }, []);

  // 🔹 Save when updated
  useEffect(() => {
    if (authData) {
      localStorage.setItem("authData", JSON.stringify(authData));
    }
  }, [authData]);

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
