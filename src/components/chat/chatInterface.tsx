import { useState, useRef } from "react";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { Button } from "../ui/button";
import { useChatContext } from "../../provider/ChatProvider";
import {
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  useChatContext as useStreamChatContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

interface ChatInterfaceProps {
  academy: any; // Using any since it's EnhancedAcademy from ChatProvider
  channel: any; // Stream Chat Channel object
  onBack: () => void;
}

export function ChatInterface({
  academy,
  channel,
  onBack,
}: ChatInterfaceProps) {
  const { setCurrentChannel } = useChatContext();
  const { setActiveChannel } = useStreamChatContext();

  // Handle back navigation properly
  const handleBack = () => {
    setCurrentChannel(null);
    setActiveChannel(undefined);
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Custom Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-zinc-400 hover:text-white flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            {academy.name?.charAt(0).toUpperCase() || "A"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white truncate">
            {academy.name || `Academy ${academy.contract_address?.slice(0, 8)}`}
          </h2>
          <p className="text-sm text-zinc-400 truncate">
            {academy.memberCount || 0} members
          </p>
        </div>
      </div>

      {/* Stream Chat Components */}
      <div className="flex-1">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
        </Channel>
      </div>
    </div>
  );
}

// Keep these components for future use if you want custom audio/video messages
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
