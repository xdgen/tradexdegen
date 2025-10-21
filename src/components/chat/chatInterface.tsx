import type React from "react";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Play, Pause } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";
import { useChatContext, type Academy } from "../../provider/ChatProvider";
import { EmojiPicker } from "./emojiPicker";
// import { MediaRecorder } from "./mediaRecorder";

interface ChatInterfaceProps {
  academy: Academy;
  onBack: () => void;
}

export function ChatInterface({ academy, onBack }: ChatInterfaceProps) {
  const { getMessagesForAcademy, sendMessage } = useChatContext();
  const messages = getMessagesForAcademy(academy.id);

  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    sendMessage(academy.id, newMessage);
    setNewMessage("");
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  //   const handleRecordingComplete = (
  //     blob: Blob,
  //     type: "audio" | "video",
  //     duration: number
  //   ) => {
  //     const url = URL.createObjectURL(blob);
  //     sendMessage(academy.id, url, type, duration);
  //   };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  //   const formatDuration = (seconds: number) => {
  //     const mins = Math.floor(seconds / 60);
  //     const secs = seconds % 60;
  //     return `${mins}:${secs.toString().padStart(2, "0")}`;
  //   };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-2xl">{academy.avatar}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{academy.name}</h3>
          <p className="text-sm text-zinc-400">{academy.memberCount} members</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col",
                message.isCurrentUser ? "items-end" : "items-start"
              )}
            >
              {!message.isCurrentUser && (
                <span className="text-xs text-emerald-400 font-medium mb-1 px-1">
                  {message.userName}
                </span>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.isCurrentUser
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-white"
                )}
              >
                {message.type === "text" && (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}

                {message.type === "audio" && (
                  <AudioMessage
                    url={message.content}
                    duration={message.duration || 0}
                  />
                )}

                {message.type === "video" && (
                  <VideoMessage
                    url={message.content}
                    duration={message.duration || 0}
                  />
                )}

                <span className="text-xs opacity-70 mt-1 block">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="px-2.5 py-4 border-t border-zinc-800"
      >
        <div className="flex gap-2 items-center">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />

          {/* <MediaRecorder
            onRecordingComplete={handleRecordingComplete}
            type="audio"
          />

          <MediaRecorder
            onRecordingComplete={handleRecordingComplete}
            type="video"
          /> */}

          <div className="grid grid-cols-[1fr_max-content] items-center gap-x-2 flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-zinc-900 w-full border-zinc-800 text-white placeholder:text-zinc-500 text-base"
            />

            <Button
              type="submit"
              size="icon"
              className="size-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function AudioMessage({ url, duration }: { url: string; duration: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20"
        type="button"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>
      <div className="flex-1">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 w-0" />
        </div>
      </div>
      <span className="text-xs font-mono">{formatDuration(duration)}</span>
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}

function VideoMessage({ url, duration }: { url: string; duration: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={url}
          className="w-full max-w-xs"
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            type="button"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="h-8 w-8 text-black ml-1" />
            </div>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="font-mono">{formatDuration(duration)}</span>
      </div>
    </div>
  );
}
