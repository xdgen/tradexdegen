import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface Message {
  id: string;
  academyId: string;
  userId: string;
  userName: string;
  content: string;
  type: "text" | "audio" | "video";
  timestamp: Date;
  isCurrentUser: boolean;
  duration?: number; // For audio/video messages
}

export interface Academy {
  id: string;
  name: string;
  memberCount: number;
  avatar: string;
}

interface ChatContextType {
  messages: Record<string, Message[]>;
  academies: Academy[];
  currentUser: { id: string; name: string };
  sendMessage: (
    academyId: string,
    content: string,
    type?: "text" | "audio" | "video",
    duration?: number
  ) => void;
  getMessagesForAcademy: (academyId: string) => Message[];
  getUnreadCount: (academyId: string) => number;
  markAsRead: (academyId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Mock initial data
const INITIAL_ACADEMIES: Academy[] = [
  { id: "1", name: "DeFi Masters", memberCount: 234, avatar: "🚀" },
  { id: "2", name: "NFT Degen Club", memberCount: 189, avatar: "🎨" },
  { id: "3", name: "Crypto Trading Pro", memberCount: 456, avatar: "📈" },
  { id: "4", name: "Web3 Builders", memberCount: 321, avatar: "⚡" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    academyId: "1",
    userId: "2",
    userName: "CryptoWhale",
    content: "GM everyone! Ready for today's session?",
    type: "text",
    timestamp: new Date(Date.now() - 3600000),
    isCurrentUser: false,
  },
  {
    id: "2",
    academyId: "1",
    userId: "3",
    userName: "DegenKing",
    content: "LFG! Can't wait to learn more about yield farming",
    type: "text",
    timestamp: new Date(Date.now() - 3000000),
    isCurrentUser: false,
  },
  {
    id: "3",
    academyId: "1",
    userId: "1",
    userName: "You",
    content: "Hey guys! Excited to be here",
    type: "text",
    timestamp: new Date(Date.now() - 2400000),
    isCurrentUser: true,
  },
  {
    id: "4",
    academyId: "2",
    userId: "4",
    userName: "NFTCollector",
    content: "Just minted a new collection! Check it out",
    type: "text",
    timestamp: new Date(Date.now() - 7200000),
    isCurrentUser: false,
  },
  {
    id: "5",
    academyId: "2",
    userId: "5",
    userName: "ArtistDegen",
    content: "Looks fire! What's the floor price?",
    type: "text",
    timestamp: new Date(Date.now() - 6000000),
    isCurrentUser: false,
  },
  {
    id: "6",
    academyId: "4",
    userId: "6",
    userName: "DevMaster",
    content: "Anyone working on Solidity contracts today?",
    type: "text",
    timestamp: new Date(Date.now() - 1800000),
    isCurrentUser: false,
  },
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    // Group initial messages by academy
    const grouped: Record<string, Message[]> = {};
    INITIAL_MESSAGES.forEach((msg) => {
      if (!grouped[msg.academyId]) {
        grouped[msg.academyId] = [];
      }
      grouped[msg.academyId].push(msg);
    });
    return grouped;
  });

  const [readStatus, setReadStatus] = useState<Record<string, number>>({});
  const [academies] = useState<Academy[]>(INITIAL_ACADEMIES);
  const currentUser = { id: "1", name: "You" };

  const sendMessage = useCallback(
    (
      academyId: string,
      content: string,
      type: "text" | "audio" | "video" = "text",
      duration?: number
    ) => {
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        academyId,
        userId: currentUser.id,
        userName: currentUser.name,
        content,
        type,
        timestamp: new Date(),
        isCurrentUser: true,
        duration,
      };

      setMessages((prev) => ({
        ...prev,
        [academyId]: [...(prev[academyId] || []), newMessage],
      }));

      // Simulate other users responding after a delay
      setTimeout(() => {
        const responses = [
          "That's a great point!",
          "Agreed! 💯",
          "LFG! 🚀",
          "Interesting perspective",
          "Can you share more details?",
          "This is the way",
        ];
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];
        const randomUser = [
          "CryptoWhale",
          "DegenKing",
          "NFTCollector",
          "ArtistDegen",
          "DevMaster",
        ][Math.floor(Math.random() * 5)];

        const responseMessage: Message = {
          id: `${Date.now()}-${Math.random()}`,
          academyId,
          userId: `user-${Math.random()}`,
          userName: randomUser,
          content: randomResponse,
          type: "text",
          timestamp: new Date(),
          isCurrentUser: false,
        };

        setMessages((prev) => ({
          ...prev,
          [academyId]: [...(prev[academyId] || []), responseMessage],
        }));
      }, 2000 + Math.random() * 3000);
    },
    []
  );

  const getMessagesForAcademy = useCallback(
    (academyId: string) => {
      return messages[academyId] || [];
    },
    [messages]
  );

  const getUnreadCount = useCallback(
    (academyId: string) => {
      const academyMessages = messages[academyId] || [];
      const lastReadIndex = readStatus[academyId] || 0;
      const unreadMessages = academyMessages
        .slice(lastReadIndex)
        .filter((msg) => !msg.isCurrentUser);
      return unreadMessages.length;
    },
    [messages, readStatus]
  );

  const markAsRead = useCallback(
    (academyId: string) => {
      setReadStatus((prev) => ({
        ...prev,
        [academyId]: messages[academyId]?.length || 0,
      }));
    },
    [messages]
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        academies,
        currentUser,
        sendMessage,
        getMessagesForAcademy,
        getUnreadCount,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
