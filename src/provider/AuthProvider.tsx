import { useWallet } from "@solana/wallet-adapter-react";
import React, {
  useContext,
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { axios, axiosAsync } from "../lib/axios";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";
import useLocalStorageSubscription, {
  triggerLocalStorageChange,
} from "../hooks/useLocalStorageSubscription";
import { useQuery } from "@tanstack/react-query";

interface IAuthContext {
  isCheckingUserRole: boolean;
  isRoleDialogOpen: boolean;
  closeRoleDialog: () => void;
  isStudentDialogOpen: boolean;
  closeStudentDialog: () => void;
  userProfile: UserProfile | null;
  role: Role | null;
  authData: AuthResponse | null;
  registerUserRole: (role: Role) => void;
  isAuthenticated: boolean;
  refetchUserProfile: () => void;
  isLoadingProfile: boolean;
}

interface IAuthProvider {
  children: React.ReactNode;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: IAuthProvider) => {
  const [isCheckingUserRole, setIsCheckingUserRole] = useState(false);
  const { publicKey, connected } = useWallet();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const key =
    connected && publicKey ? `userRole:${publicKey.toString()}` : null;
  const [role, setRole, roleRef] = useLocalStorageSubscription<Role>(
    key,
    (val) => val as Role,
    null
  ) as unknown as [
    Role | null,
    React.Dispatch<React.SetStateAction<Role | null>>,
    React.MutableRefObject<Role | null>
  ];
  const isAuthenticated = useMemo(
    () => (connected && publicKey && role ? true : false),
    [connected, publicKey, role]
  );

  // Fetch user profile
  const {
    isLoading: isLoadingProfile,
    refetch: refetchUserProfile,
    data: profileResponse,
    error: profileError,
  } = useQuery<APIResponse<UserProfile>>({
    queryKey: ["user-profile", authData?.user?.id],
    queryFn: async () => {
      if (!authData?.token?.accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await axiosAsync.get("/user/profile");
      return response.data;
    },
    enabled: !!authData?.token?.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  useEffect(() => {
    if (profileResponse?.success) {
      setUserProfile(profileResponse.data);
    }
  }, [profileResponse]);

  useEffect(() => {
    if (profileError) {
      toast.error(`Failed to fetch user profile: ${profileError}`);
    }
  }, [profileError]);

  const updateAuthData = (data: AuthResponse, publicKey: PublicKey) => {
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

    localStorage.setItem(`userRole:${publicKey.toString()}`, data.user.role);
    localStorage.setItem("authData", JSON.stringify(data));
  };

  // Register User Role
  const registerUserRole = async (newRole: Role) => {
    if (!publicKey || !newRole) return;

    try {
      const response = await axios.post("/auth/register", {
        wallet: publicKey,
        role: newRole.toUpperCase(),
      });
      const data = response.data as AuthResponse;

      setRole(data.user.role as Role);
      roleRef.current = data.user.role as Role;

      if (data.user.role === "STUDENT") setIsStudentDialogOpen(true);
      updateAuthData(data, publicKey);
      toast.success("User successfully registered");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Unknown error occurred";
      toast.error(message);
    }
  };

  // Login for existing users
  const loginUser = async (publicKey: PublicKey) => {
    try {
      const response = await axios.post("/auth/login", {
        wallet: publicKey.toString(),
      });

      const data = response.data as APIResponse<AuthResponse>;

      if (data.success) {
        updateAuthData(data.data, publicKey);
        setRole(data.data.user.role as Role);
        roleRef.current = data.data.user.role as Role;

        if (data.data.user.role === "ACADEMY") {
          localStorage.setItem(`academy-${data.data.user.id}`, "true");
          triggerLocalStorageChange(`academy-${data.data.user.id}`);
        }

        toast.success(data.message || "Login successful");
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const checkIfWalletExist = useCallback(async () => {
    if (!connected || !publicKey) return;

    if (roleRef.current) return;

    try {
      setIsCheckingUserRole(true);

      // Clear user role
      localStorage.removeItem(`userRole:${publicKey.toString()}`);

      const response = await axios(`/auth/check-wallet/${publicKey}`);
      const data = response.data as CheckUserResponse;

      if (data.status) {
        // Login exisiting user
        await loginUser(publicKey);
      } else {
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
    if (connected && publicKey && !role) {
      checkIfWalletExist();
    }
  }, [checkIfWalletExist]);

  const closeRoleDialog = () => setIsRoleDialogOpen(false);
  const closeStudentDialog = () => setIsStudentDialogOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isCheckingUserRole,
        isRoleDialogOpen,
        closeStudentDialog,
        authData,
        userProfile,
        closeRoleDialog,
        isAuthenticated,
        role,
        isStudentDialogOpen,
        registerUserRole,
        refetchUserProfile,
        isLoadingProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a UserRoleProvider");
  }
  return context;
};
