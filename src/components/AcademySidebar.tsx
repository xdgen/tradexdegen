import { useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { ChatInterface } from "./chat/chatInterface";
import { cn } from "..//lib/utils";
import { useChatContext } from "../provider/ChatProvider";
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  useCreateChatClient,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

interface AcademySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const apiKey =
  "qhh94cd4jpww57wd3y8ygfzz4bs3gp8ageumb7nbgjx59bmgjh9gtqt8u44bv8ve";
const userId = "user-id";
const token = "authentication-tokenafun28vnpbqp";

const filters = { members: { $in: [userId] }, type: "messaging" };
const options = { presence: true, state: true };

export function AcademySidebar({ isOpen, onClose }: AcademySidebarProps) {
  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: token,
    userData: { id: userId },
  });

  const [selectedAcademy, setSelectedAcademy] = useState<string | null>(null);
  const { academies, getUnreadCount, markAsRead } = useChatContext();

  const handleBack = () => {
    setSelectedAcademy(null);
  };

  const handleSelectAcademy = (academyId: string) => {
    setSelectedAcademy(academyId);
    markAsRead(academyId);
  };

  const selectedAcademyData = academies.find((a) => a.id === selectedAcademy);

  if (!client) return <div>Loading...</div>;

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-full md:w-96 bg-black border-l border-zinc-800 z-[100]",
        "transform transition-transform duration-300 ease-in-out z-40",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {selectedAcademy && selectedAcademyData ? (
        <ChatInterface academy={selectedAcademyData} onBack={handleBack} />
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Your Academies</h2>
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
            <div className="p-4 space-y-2">
              {academies.map((academy) => {
                const unreadCount = getUnreadCount(academy.id);

                return (
                  <button
                    key={academy.id}
                    onClick={() => handleSelectAcademy(academy.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border border-zinc-800",
                      "bg-zinc-900/50 hover:bg-zinc-800/50",
                      "transition-colors text-left group"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{academy.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {academy.name}
                          </h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-600 text-white rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-zinc-400">
                          <Users className="h-3 w-3" />
                          <span>{academy.memberCount} members</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <Chat client={client}>
              <ChannelList
                filters={filters}
                sort={{ last_message_at: -1 }}
                options={options}
              />
              <Channel>
                <MessageList />
                <MessageInput />
              </Channel>
            </Chat>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
