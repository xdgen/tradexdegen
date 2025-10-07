import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserRoleSchemaType,
  userRoleSchema,
} from "../../lib/schemas/community.schema.ts";

export function useUserRole() {
  const form = useForm<UserRoleSchemaType>({
    resolver: zodResolver(userRoleSchema),
    mode: "onChange",
    defaultValues: {
      role: undefined,
    },
  });

  const onSubmit = (data: UserRoleSchemaType, callback: () => void) => {
    console.log(data, "data");
    callback();
  };

  return {
    form,
    onSubmit,
  };
}

export const useCheckUserRole = () => {
  const [isCheckingUserRole, setIsCheckingUserRole] = useState(false);
  const { publicKey, connected } = useWallet();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const roleRef = useRef<Role | null>(null);

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

  const checkIfWalletExist = useCallback(async () => {
    if (!connected || !publicKey) return;

    if (roleRef.current) return;

    try {
      setIsCheckingUserRole(true);

      // Simulate an async operation, e.g., fetching data from an API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would typically check if the wallet exists in your backend
      const response = "student";

      if (response) {
        // Set role from API Response and
        setRole(response);
        localStorage.setItem(`userRole:${publicKey.toString()}`, response);
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

  return {
    isCheckingUserRole,
    isRoleDialogOpen,
    closeDialog,
    role,
  };
};
