import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Channel, LocalMessage, StreamChat } from "stream-chat";

import { useAuth } from "./AuthProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { axiosAsync } from "../lib/axios";

interface ChatContextType {
  client: StreamChat | null;
  isConnected: boolean;
  academies: Academy[];
  currentChannel: Channel | null;
  connectUser: () => Promise<void>;
  // disconnectUser: () => void;
  setCurrentChannel: (channel: Channel | null) => void;
  loading: boolean;
  error: string | null;
  refreshAcademies: () => void;
  // initializeAcademyChannel: (academyId: string) => Promise<Channel>;
  // isFetchingAcademies: boolean;
  // academiesError: Error | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [academies, setAcademies] = useState<Academy[]>([]);
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
  console.log(studentAcademiesData?.enrollments);

  // Transform enrollments to academies format
  // const transformEnrollmentsToAcademies = useCallback(
  //   (enrollments: Enrollment[]): Academy[] => {
  //     return enrollments.map((enrollment) => ({
  //       id: enrollment.academyId,
  //       streamId: enrollment.,
  //       contract_address: enrollment.academy.contract_address,
  //       memberCount: 0, // Will be updated by Stream data
  //       unreadCount: 0, // Will be updated by Stream data
  //     }));
  //   },
  //   []
  // );

  // id: string;
  // streamId: string;
  // contract_address: string;
  // created_at: Date;
  // updated_at: Date;
  // userId: string;

  // TanStack Query: Enrich each academy with Stream Chat data
  // const academyChannelQueries = useQueries({
  //   queries: (studentAcademiesData?.enrollments || []).map((enrollment) => ({
  //     queryKey: ["academy-channel", enrollment?.academy?.streamId],
  //     queryFn: async (): Promise<Academy & { memberCount: number; unreadCount: number; lastMessage: LocalMessage; messageCount: number }> => {
  //       if (!client || !isConnected) {
  //         throw new Error("Stream client not connected");
  //       }

  //       const academyData = enrollment.academy;

  //       try {
  //         // Get the channel for this academy
  //         const channel = client.channel("messaging", academyData?.streamId);
  //         await channel.watch(); // This fetches the channel state

  //         // Get message count and unread count
  //         const messageCount = channel.state.messages.length;
  //         const unreadCount = channel.countUnread();
  //         const memberCount = Object.keys(channel.state.members).length;
  //         const lastMessage =
  //           channel.state.messages[channel.state.messages.length - 1];

  //         return {
  //           ...academyData,
  //           memberCount,
  //           unreadCount,
  //           lastMessage,
  //           messageCount,
  //         };
  //       } catch (channelError) {
  //         console.error(
  //           `Failed to fetch channel data for academy ${academyData?.id}:`,
  //           channelError
  //         );
  //       }
  //     },
  //     enabled: !!client && isConnected && !!studentAcademiesData?.enrollments,
  //     staleTime: 1000 * 30, // 30 seconds for real-time data
  //     retry: 1,
  //   })),
  // });

  // Combine all academy data when queries complete
  // useEffect(() => {
  //   if (studentAcademiesData?.enrollments && academyChannelQueries.length > 0) {
  //     const allQueriesLoaded = academyChannelQueries.every(
  //       (query) => !query.isLoading
  //     );
  //     const hasErrors = academyChannelQueries.some((query) => query.error);

  //     if (allQueriesLoaded) {
  //       const enrichedAcademies: Academy[] = academyChannelQueries
  //         .map(
  //           (query) =>
  //             query.data ||
  //             transformEnrollmentsToAcademies(
  //               studentAcademiesData.enrollments
  //             ).find((academy) => academy.streamId === query.data)
  //         )
  //         .filter(Boolean) as Academy[];

  //       setAcademies(enrichedAcademies);

  //       if (hasErrors) {
  //         console.warn(
  //           "Some academy channels failed to load, using basic academy data"
  //         );
  //       }
  //     }
  //   }
  // }, [
  //   studentAcademiesData,
  //   academyChannelQueries,
  //   transformEnrollmentsToAcademies,
  // ]);

  // Connect user to Stream Chat using the streamToken from userProfile
  const connectUser = useCallback(async () => {
    if (!client || !userProfile?.streamToken || !userProfile?.id) {
      console.log("Missing required connection data");
      return;
    }

    try {
      console.log("🔄 Connecting to Stream Chat...");

      await client.connectUser(
        {
          id: userProfile.id,
          name: `User ${userProfile.wallet?.slice(0, 8)}...` || "Anonymous",
          role: userProfile.role,
        },
        userProfile.streamToken
      );

      console.log("✅ Successfully connected to Stream Chat");
    } catch (error) {
      console.error("❌ Failed to connect to Stream Chat:", error);
    }
  }, [
    client,
    userProfile?.streamToken,
    userProfile?.id,
    userProfile?.wallet,
    userProfile?.role,
  ]);

  /**
   * Initialize academy channel when user clicks on an academy
   */
  // const initializeAcademyChannel = useCallback(
  //   async (academyId: string): Promise<Channel> => {
  //     if (!client || !isConnected) {
  //       throw new Error("Stream Chat not connected");
  //     }

  //     const academy = academies.find((a) => a.id === academyId);
  //     if (!academy) {
  //       throw new Error("Academy not found");
  //     }

  //     try {
  //       // Create channel instance
  //       const channel = client.channel("messaging", academy.streamId);

  //       // Watch the channel to initialize it and get real-time updates
  //       await channel.watch();

  //       // Set as current channel
  //       setCurrentChannel(channel);

  //       return channel;
  //     } catch (err) {
  //       console.error("Failed to initialize academy channel:", err);
  //       throw new Error("Failed to initialize chat channel");
  //     }
  //   },
  //   [client, isConnected, academies]
  // );

  /**
   * Refresh academies manually
   */
  const refreshAcademies = useCallback(() => {
    refetchStudentAcademies();
    // The academyChannelQueries will automatically refetch due to dependency on studentAcademiesData
  }, [refetchStudentAcademies]);

  /**
   * Disconnect user from Stream Chat
   */
  // const disconnectUser = useCallback(() => {
  //   if (client) {
  //     client.disconnectUser();
  //     setIsConnected(false);
  //     setAcademies([]);
  //     setCurrentChannel(null);
  //     setError(null);
  //   }
  // }, [client]);

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
    userProfile?.streamToken, // Use specific properties instead of entire object
    connected,
    connectUser, // Now stable due to useCallback
  ]);

  // Auto-disconnect when authentication is lost
  // useEffect(() => {
  //   if (!isAuthenticated && isConnected) {
  //     disconnectUser();
  //   }
  // }, [isAuthenticated, isConnected, disconnectUser]);

  // Derived loading and error states
  // const isFetchingAcademies =
  //   isFetchingStudentAcademies ||
  //   academyChannelQueries.some((query) => query.isLoading);
  // const academiesError =
  //   studentAcademiesError ||
  //   academyChannelQueries.find((query) => query.error)?.error ||
  //   null;

  const contextValue: ChatContextType = {
    client,
    isConnected,
    academies,
    currentChannel,
    connectUser,
    // disconnectUser,
    setCurrentChannel,
    loading,
    error,
    refreshAcademies,
    // initializeAcademyChannel,
    // isFetchingAcademies,
    // academiesError,
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
