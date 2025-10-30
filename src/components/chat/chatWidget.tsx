import { useState, useEffect, useCallback } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { AcademySidebar } from "../AcademySidebar";
import { cn } from "../../lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../../provider/AuthProvider";
import { useChatContext } from "../../provider/ChatProvider";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowWidget, setShouldShowWidget] = useState(false);

  const { connected } = useWallet();
  const { role, isAuthenticated, userProfile } = useAuth();
  const {
    isConnected,
    academies,
    loading: chatLoading,
    isFetchingAcademies,
    refreshAcademies,
  } = useChatContext();

  // Check widget visibility - removed from dependencies to break circular loop
  useEffect(() => {
    if (!isAuthenticated || !userProfile) {
      setShouldShowWidget(false);
      return;
    }

    // For students: show if enrolled in any academies AND Stream is connected
    if (role === "STUDENT") {
      const hasEnrollments = academies.length > 0;
      setShouldShowWidget(hasEnrollments && isConnected);
    }
    // For academies: show if they have academies AND Stream is connected
    else if (role === "ACADEMY") {
      const hasAcademies = academies.length > 0;
      setShouldShowWidget(hasAcademies && isConnected);
    } else {
      setShouldShowWidget(false);
    }
  }, [isAuthenticated, userProfile, role, academies.length, isConnected]);

  // Refresh academies when widget opens - simplified to avoid callback dependency
  useEffect(() => {
    if (isOpen && isConnected) {
      refreshAcademies();
    }
  }, [isOpen, isConnected, refreshAcademies]);

  // Close widget if it should no longer be shown
  useEffect(() => {
    if (!shouldShowWidget && isOpen) {
      setIsOpen(false);
    }
  }, [shouldShowWidget, isOpen]);

  // Show loading spinner while connecting to Stream or loading academies
  const showLoadingSpinner =
    chatLoading || isFetchingAcademies || (isAuthenticated && !isConnected);

  if (showLoadingSpinner) {
    return (
      <Button
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg",
          "bg-gray-600 text-white cursor-not-allowed",
          "z-40"
        )}
        size="icon"
        disabled
      >
        <Loader2 className="h-6 w-6 animate-spin" />
      </Button>
    );
  }

  if (!shouldShowWidget) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleToggle}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all",
          "bg-emerald-600 hover:bg-emerald-700 text-white",
          "z-40"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      <AcademySidebar isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
