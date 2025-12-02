import { useState } from "react";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  useChat,
  useParticipants,
  RoomAudioRenderer,
  Chat,
  ChatEntry,
} from "@livekit/components-react";

interface Props {
  academyName: string;
  onBack: () => void;
}

export function ChatInterface({ academyName, onBack }: Props) {
  const chat = useChat();
  const participants = useParticipants();
  const [message, setMessage] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    chat.send(message, {
      attachments: [file],
    });
  };

  const sendMessage = () => {
    if (message.trim()) {
      chat.send(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <RoomAudioRenderer />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="font-bold text-lg truncate max-w-48">
              {academyName}
            </h2>
            <p className="text-xs text-zinc-400">
              {participants.length} online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Chat />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <Paperclip className="h-5 w-5 text-zinc-400 hover:text-white" />
            <input type="file" className="hidden" onChange={handleFile} />
          </label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
