import { LiveKitRoom } from "@livekit/components-react";
import { ArrowLeft, Users, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useLiveKitChat } from "../provider/LiveKitChatProvider";
import { ChatInterface } from "./chat/chatInterface";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AcademySidebar({ isOpen, onClose }: Props) {
  const { academies, currentRoom, enterRoom, leaveRoom } = useLiveKitChat();

  if (currentRoom) {
    return (
      <LiveKitRoom
        token={currentRoom.token}
        serverUrl={currentRoom.serverUrl}
        connect={true}
      >
        <ChatInterface
          academyName={currentRoom.academyName}
          onBack={leaveRoom}
        />
      </LiveKitRoom>
    );
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full md:w-96 bg-black border-l border-zinc-800 transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Academies</h2>
            <p className="text-sm text-zinc-400">{academies.length} active</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Academy List */}
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-4">
            {academies.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No enrolled academies yet</p>
              </div>
            ) : (
              academies.map((academy) => {
                const displayName =
                  academy.name ||
                  `Academy ${academy.contract_address.slice(0, 8)}`;

                return (
                  <button
                    key={academy.id}
                    onClick={() => enterRoom(academy.id)}
                    className="w-full p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 hover:border-emerald-500/70 transition-all text-left group shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors truncate">
                          {displayName}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {academy.memberCount > 0
                              ? `${academy.memberCount} online`
                              : "Join to chat"}
                          </span>
                        </div>
                        {academy.lastMessage && (
                          <p className="text-xs text-zinc-500 mt-2 truncate">
                            <strong>{academy.lastMessage.from}:</strong>{" "}
                            {academy.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
