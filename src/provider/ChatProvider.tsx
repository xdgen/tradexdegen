import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Channel, StreamChat } from "stream-chat";
import { useAuth } from "./AuthProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { axiosAsync } from "../lib/axios";

interface EnhancedAcademy extends Academy {
  memberCount?: number;
  unreadCount?: number;
  lastMessage?: any;
  messageCount?: number;
  name?: string;
}

interface ChatContextType {
  client: StreamChat | null;
  isConnected: boolean;
  academies: EnhancedAcademy[];
  currentChannel: Channel | null;
  connectUser: () => Promise<void>;
  disconnectUser: () => void;
  setCurrentChannel: (channel: Channel | null) => void;
  loading: boolean;
  error: string | null;
  refreshAcademies: () => void;
  isFetchingAcademies: boolean;
  academiesError: Error | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [academies, setAcademies] = useState<EnhancedAcademy[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userProfile, role, isAuthenticated } = useAuth();
  const { connected } = useWallet();

  // Initialize Stream client
  useEffect(() => {
    const streamClient = StreamChat.getInstance(
      process.env.VITE_STREAM_API_KEY!
    );
    setClient(streamClient);

    return () => {
      streamClient.disconnectUser();
    };
  }, []);

  // Fetch student enrolled academies
  const {
    data: studentAcademiesData,
    isLoading: isFetchingStudentAcademies,
    error: studentAcademiesError,
    refetch: refetchStudentAcademies,
  } = useQuery({
    queryKey: ["student-academies", userProfile?.id],
    queryFn: async (): Promise<StudentAcademies> => {
      if (!userProfile?.id) {
        throw new Error("User ID not available");
      }

      const response = await axiosAsync(
        `/students/${userProfile.id}/get-academies`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch academies");
      }

      return response.data.data;
    },
    enabled: !!userProfile?.id && role === "STUDENT",
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Extract academies from enrollments
  const extractAcademiesFromEnrollments = useMemo((): EnhancedAcademy[] => {
    if (!studentAcademiesData?.enrollments) return [];

    return studentAcademiesData.enrollments
      .map((enrollment) => enrollment.academy)
      .filter((academy): academy is Academy => academy !== undefined)
      .map((academy) => ({
        ...academy,
        name: `Academy ${academy.contract_address.slice(0, 8)}`,
        memberCount: 0,
        unreadCount: 0,
        messageCount: 0,
      }));
  }, [studentAcademiesData]);

  // Connect user to Stream Chat
  const connectUser = useCallback(async () => {
    if (!client || !userProfile?.streamToken || !userProfile?.id) {
      console.log("Missing required connection data");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Connecting to Stream Chat...");

      await client.connectUser(
        {
          id: userProfile.id,
          name: `User ${userProfile.wallet?.slice(0, 8)}...` || "Anonymous",
          role: userProfile.role.toLowerCase(),
        },
        userProfile.streamToken
      );

      setIsConnected(true);
      console.log("✅ Successfully connected to Stream Chat");
    } catch (error) {
      console.error("❌ Failed to connect to Stream Chat:", error);
      setError("Failed to connect to chat service");
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [client, userProfile]);

  // TanStack Query: Get academy channel data
  const academyChannelQueries = useQueries({
    queries: (extractAcademiesFromEnrollments || []).map((academy) => ({
      queryKey: ["academy-channel", academy.streamId, academy.id],
      queryFn: async (): Promise<EnhancedAcademy> => {
        if (!client || !isConnected) {
          throw new Error("Stream client not connected");
        }

        if (!academy.streamId) {
          throw new Error("Academy streamId not available");
        }

        try {
          // Get the channel for this academy
          const channel = client.channel("messaging", academy.streamId);
          await channel.watch(); // This fetches the channel state

          // Get message count and unread count
          const messageCount = channel.state.messages.length;
          const unreadCount = channel.countUnread();
          const memberCount = Object.keys(channel.state.members).length;
          const lastMessage =
            channel.state.messages[channel.state.messages.length - 1];

          return {
            ...academy,
            memberCount,
            unreadCount,
            lastMessage,
            messageCount,
            name: `Academy ${academy.contract_address.slice(0, 8)}`,
          };
        } catch (channelError) {
          console.error(
            `Failed to fetch channel data for academy ${academy.id}:`,
            channelError
          );
          // Return basic academy data if channel fetch fails
          return {
            ...academy,
            memberCount: 0,
            unreadCount: 0,
            messageCount: 0,
            name: `Academy ${academy.contract_address.slice(0, 8)}`,
          };
        }
      },
      enabled: !!client && isConnected && !!studentAcademiesData?.enrollments,
      staleTime: 1000 * 30, // 30 seconds for real-time data
      retry: 1,
    })),
  });

  // Combine academy data
  useEffect(() => {
    const basicAcademies = extractAcademiesFromEnrollments;

    if (academyChannelQueries.length > 0) {
      const allQueriesLoaded = academyChannelQueries.every(
        (query) => !query.isLoading
      );

      if (allQueriesLoaded) {
        const enrichedAcademies: EnhancedAcademy[] = academyChannelQueries
          .map((query, index) => query.data || basicAcademies[index] || null)
          .filter(Boolean) as EnhancedAcademy[];

        setAcademies(enrichedAcademies);
      }
    } else {
      setAcademies(basicAcademies);
    }
  }, [
    studentAcademiesData,
    academyChannelQueries,
    extractAcademiesFromEnrollments,
  ]);

  const refreshAcademies = useCallback(() => {
    refetchStudentAcademies();
  }, [refetchStudentAcademies]);

  const disconnectUser = useCallback(() => {
    if (client) {
      client.disconnectUser();
      setIsConnected(false);
      setAcademies([]);
      setCurrentChannel(null);
      setError(null);
    }
  }, [client]);

  // Auto-connect
  useEffect(() => {
    if (
      isAuthenticated &&
      client &&
      !isConnected &&
      !loading &&
      userProfile?.streamToken &&
      connected
    ) {
      connectUser();
    }
  }, [
    isAuthenticated,
    client,
    isConnected,
    loading,
    userProfile?.streamToken,
    connected,
    connectUser,
  ]);

  // Auto-disconnect
  useEffect(() => {
    if (!isAuthenticated && isConnected) {
      disconnectUser();
    }
  }, [isAuthenticated, isConnected, disconnectUser]);

  const isFetchingAcademies =
    isFetchingStudentAcademies ||
    academyChannelQueries.some((query) => query.isLoading);
  const academiesError =
    studentAcademiesError ||
    academyChannelQueries.find((query) => query.error)?.error ||
    null;

  const contextValue: ChatContextType = {
    client,
    isConnected,
    academies,
    currentChannel,
    connectUser,
    disconnectUser,
    setCurrentChannel,
    loading,
    error,
    refreshAcademies,
    isFetchingAcademies,
    academiesError,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
