import { useState, useEffect } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useLiveKitChat } from "../../provider/LiveKitChatProvider";
import { useAuth } from "../../provider/AuthProvider";
import { AcademySidebar } from "../AcademySidebar";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { academies, isLoading } = useLiveKitChat();
  const { isAuthenticated } = useAuth();

  const hasAcademies = academies.length > 0;

  // Auto-close if user logs out or has no academies
  useEffect(() => {
    if (!isAuthenticated || !hasAcademies) {
      setIsOpen(false);
    }
  }, [isAuthenticated, hasAcademies]);

  if (isLoading) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gray-700"
        disabled
      >
        <Loader2 className="h-6 w-6 animate-spin" />
      </Button>
    );
  }

  if (!isAuthenticated || !hasAcademies) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-2xl z-50 transition-all"
        size="icon"
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
      </Button>

      {/* Sidebar */}
      <AcademySidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
