import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosAsync } from "../lib/axios";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

interface LiveKitRoomInfo {
  token: string;
  roomName: string;
  serverUrl: string;
  academyId: string;
  academyName: string;
}

interface AcademyWithStats extends Academy {
  name: string;
  memberCount: number;
  unreadCount: number;
  messageCount: number;
  lastMessage?: { text: string; from: string; timestamp: number };
}

interface LiveKitChatContextType {
  academies: AcademyWithStats[];
  currentRoom: LiveKitRoomInfo | null;
  enterRoom: (academyId: string) => void;
  leaveRoom: () => void;
  createAcademyRoom: (academyId: string, academyName: string) => void;
  isLoading: boolean;
}

const LiveKitChatContext = createContext<LiveKitChatContextType | undefined>(
  undefined
);

export function LiveKitChatProvider({ children }: { children: ReactNode }) {
  const { userProfile, role } = useAuth();
  const queryClient = useQueryClient();
  const [currentRoom, setCurrentRoom] = useState<LiveKitRoomInfo | null>(null);

  // Fetch enrolled academies
  const { data: enrolledAcademies = [], isLoading } = useQuery<Academy[]>({
    queryKey: ["student-academies", userProfile?.id],
    queryFn: async () => {
      const res = await axiosAsync(
        `/students/${userProfile?.id}/get-academies`
      );
      return res.data.data.enrollments.map((e: any) => e.academy);
    },
    enabled: !!userProfile?.id && (role === "STUDENT" || role === "ACADEMY"),
    staleTime: 1000 * 60 * 5,
  });

  const createRoomMutation = useMutation({
    mutationFn: async ({
      academyId,
      academyName,
    }: {
      academyId: string;
      academyName: string;
    }) => {
      const res = await axiosAsync.post("/livekit/create-room", {
        academyId,
        academyName,
      });
      if (!res.data.success)
        throw new Error(res.data.message || "Failed to create room");
      return res.data.data; // { roomName, sid }
    },
    onSuccess: () => {
      toast.success("Academy room created");
      queryClient.invalidateQueries({ queryKey: ["student-academies"] });
    },
    onError: (error) => {
      console.error("Create room error:", error);
      toast.error("Failed to create academy room");
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async ({
      academyId,
      academyName,
    }: {
      academyId: string;
      academyName: string;
    }) => {
      const res = await axiosAsync.post("/livekit/join-room", {
        academyId,
        academyName,
      });
      if (!res.data.success)
        throw new Error(res.data.message || "Failed to join room");
      return res.data.data; // { token, roomName, serverUrl }
    },
    onSuccess: (data, variables) => {
      setCurrentRoom({
        ...data,
        academyId: variables.academyId,
        academyName: variables.academyName,
      });
      toast.success(`Joined ${variables.academyName}`);
    },
    onError: (error) => {
      console.error("Join room error:", error);
      toast.error("Failed to join academy room");
    },
  });

  // Enhance with cached room info + real-time stats
  const academiesWithStats: AcademyWithStats[] = enrolledAcademies.map(
    (academy) => {
      // const roomInfo = joinedRooms.get(academy.id);
      const displayName = `Academy ${academy.contract_address.slice(0, 8)}`;

      return {
        ...academy,
        name: displayName,
        memberCount: true ? 1 : 0,
        unreadCount: 0,
        messageCount: 0,
        lastMessage: undefined,
      };
    }
  );

  const createAcademyRoom = (academyId: string, academyName: string) => {
    createRoomMutation.mutate({ academyId, academyName });
  };

  // Enhanced enterRoom: Triggers join mutation
  const enterRoom = (academyId: string, academyName?: string) => {
    const academy = enrolledAcademies.find((a) => a.id === academyId);
    if (!academy) return;

    const name =
      academyName || `Academy ${academy.contract_address.slice(0, 8)}`;
    joinRoomMutation.mutate({ academyId, academyName: name });
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
  };

  // useEffect(() => {
  //   if (role === "ACADEMY" && userProfile?.academy && !currentRoom) {
  //     enterRoom(userProfile.academyId, userProfile.academyName);
  //   }
  // }, [role, userProfile?.academyId, currentRoom]);

  return (
    <LiveKitChatContext.Provider
      value={{
        academies: academiesWithStats,
        currentRoom,
        createAcademyRoom,
        enterRoom,
        leaveRoom,
        isLoading,
      }}
    >
      {children}
    </LiveKitChatContext.Provider>
  );
}

export const useLiveKitChat = () => {
  const context = useContext(LiveKitChatContext);
  if (!context)
    throw new Error("useLiveKitChat must be used within LiveKitChatProvider");
  return context;
};
