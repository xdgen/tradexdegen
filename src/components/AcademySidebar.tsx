import { useState } from "react";
import { ArrowLeft, Loader2, MessageCircle, Users } from "lucide-react";
import {
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  useChatContext as useStreamChatContext,
} from "stream-chat-react";

import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { ChatInterface } from "./chat/chatInterface";
import { cn } from "..//lib/utils";
import { useChatContext } from "../provider/ChatProvider";
import { useAuth } from "../provider/AuthProvider";
import "stream-chat-react/dist/css/v2/index.css";

interface AcademySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AcademySidebar({ isOpen, onClose }: AcademySidebarProps) {
  const [selectedAcademy, setSelectedAcademy] = useState<string | null>(null);
  const { role } = useAuth();
  const {
    client,
    isConnected,
    academies,
    setCurrentChannel,
    currentChannel,
    loading,
    isFetchingAcademies,
    initializeAcademyChannel,
  } = useChatContext();

  const { setActiveChannel } = useStreamChatContext();

  const handleBack = () => {
    setSelectedAcademy(null);
    setCurrentChannel(null);
    setActiveChannel(undefined);
  };

  const handleSelectAcademy = async (academyId: string) => {
    if (!client || !isConnected) return;

    try {
      setSelectedAcademy(academyId);
      const channel = await initializeAcademyChannel(academyId);
      setActiveChannel(channel);
    } catch (error) {
      console.error("Failed to select academy channel:", error);
      // You might want to show a toast notification here
    }
  };

  const selectedAcademyData = academies.find((a) => a.id === selectedAcademy);

  if (!client || !isConnected) {
    return (
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-96 bg-black border-l border-zinc-800 z-[100]",
          "transform transition-transform duration-300 ease-in-out z-40",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Connecting to chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || isFetchingAcademies) {
    return (
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-96 bg-black border-l border-zinc-800 z-[100]",
          "transform transition-transform duration-300 ease-in-out z-40",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading academies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-full md:w-96 bg-black border-l border-zinc-800 z-[100]",
        "transform transition-transform duration-300 ease-in-out z-40",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {selectedAcademy && selectedAcademyData && currentChannel ? (
        <ChatInterface
          academy={selectedAcademyData}
          channel={currentChannel}
          onBack={handleBack}
        />
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-white">Your Academies</h2>
              <p className="text-sm text-zinc-400">
                {academies.length}{" "}
                {academies.length === 1 ? "academy" : "academies"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Academy list */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {academies.map((academy) => (
                <button
                  key={academy.id}
                  onClick={() => handleSelectAcademy(academy.id)}
                  className={cn(
                    "w-full p-4 rounded-lg border border-zinc-800",
                    "bg-zinc-900/50 hover:bg-zinc-800/50",
                    "transition-all duration-200 text-left group",
                    "hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate text-left">
                          {academy.name ||
                            `Academy ${academy.contract_address.slice(0, 8)}`}
                        </h3>
                        {academy.unreadCount && academy.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                            {academy.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Users className="h-3 w-3" />
                        <span>{academy.memberCount || 0} members</span>
                        <span className="text-zinc-600">•</span>
                        <span className="truncate">
                          {academy.contract_address.slice(0, 8)}...
                          {academy.contract_address.slice(-8)}
                        </span>
                      </div>

                      {academy.lastMessage && (
                        <p className="text-xs text-zinc-400 truncate mt-2">
                          {academy.lastMessage.text?.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {academies.length === 0 && (
                <div className="text-center py-12 text-zinc-400">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    No Academies
                  </h3>
                  <p className="text-sm max-w-xs mx-auto">
                    {role === "STUDENT"
                      ? "You are not enrolled in any academies yet."
                      : "No academy data available."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
