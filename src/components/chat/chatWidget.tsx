import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import { AcademySidebar } from "../AcademySidebar";
import { cn } from "../../lib/utils";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Chat sidebar */}
      <AcademySidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
