import { useState, useEffect } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { AcademySidebar } from "../AcademySidebar";
import { cn } from "../../lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../../provider/AuthProvider";
import { useAcademy } from "../../hooks/useAcademy";
import { useQueries } from "@tanstack/react-query";
import { axiosAsync } from "../../lib/axios";

interface AcademyDetails {
  id: string;
  title: string;
  description: string;
  banner: string;
  contractAddress: string;
  // Add other academy fields as needed
}

interface EnrollmentWithAcademy {
  enrollment: any;
  academyDetails: AcademyDetails | null;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowWidget, setShouldShowWidget] = useState(false);
  const [isCheckingEnrollments, setIsCheckingEnrollments] = useState(false);

  const { connected } = useWallet();
  const { role } = useAuth();
  const { getStudentPDA, getStudentEnrollments } = useAcademy();
  const { publicKey } = useWallet();

  // Get student PDA if wallet is connected
  const studentPDA = publicKey ? getStudentPDA(publicKey) : null;

  // Fetch student enrollments
  const { data: enrollments, isLoading } = getStudentEnrollments(studentPDA);

  // Fetch academy details for each enrollment individually
  const academyQueries = useQueries({
    queries: (enrollments || []).map((enrollment) => ({
      queryKey: ["academy", enrollment.account.academy.toBase58()],
      queryFn: async (): Promise<AcademyDetails | null> => {
        try {
          const contractAddress = enrollment.account.academy.toBase58();
          const response = await axiosAsync.get(
            `/academies/${contractAddress}`
          );

          return response.data.data;
        } catch (error) {
          console.error(
            `Failed to fetch academy ${enrollment.account.academy.toBase58()}:`,
            error
          );
          return null;
        }
      },
      enabled: !!enrollments && enrollments.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    })),
  });

  // Combine enrollments with academy details
  const enrollmentsWithAcademies: EnrollmentWithAcademy[] = (
    enrollments || []
  ).map((enrollment, index) => ({
    enrollment,
    academyDetails: academyQueries[index]?.data || null,
  }));

  const isLoadingAcademies = academyQueries.some((query) => query.isLoading);

  // Check if widget should be shown
  useEffect(() => {
    const checkEnrollments = async () => {
      if (!connected || role !== "STUDENT" || !studentPDA) {
        setShouldShowWidget(false);
        setIsCheckingEnrollments(false);
        return;
      }

      setIsCheckingEnrollments(true);

      if (enrollments && enrollments.length > 0) {
        setShouldShowWidget(true);
      } else {
        setShouldShowWidget(false);
      }

      setIsCheckingEnrollments(false);
    };

    checkEnrollments();
  }, [connected, role, enrollments, studentPDA]);

  useEffect(() => {
    if (!shouldShowWidget && isOpen) {
      setIsOpen(false);
    }
  }, [shouldShowWidget, isOpen]);

  // Show loading spinner while checking enrollments or fetching academy details
  const showLoadingSpinner =
    isCheckingEnrollments ||
    (connected && role === "STUDENT" && studentPDA && isLoading) ||
    (connected &&
      role === "STUDENT" &&
      enrollments &&
      enrollments.length > 0 &&
      isLoadingAcademies);

  if (showLoadingSpinner) {
    return (
      <Button
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg",
          "bg-gray-600 text-white cursor-not-allowed",
          "z-40"
        )}
        size="icon"
        disabled
      >
        <Loader2 className="h-6 w-6 animate-spin" />
      </Button>
    );
  }

  if (!shouldShowWidget) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all",
          "bg-emerald-600 hover:bg-emerald-700 text-white",
          "z-40"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      <AcademySidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        // enrollmentsWithAcademies={enrollmentsWithAcademies}
      />
    </>
  );
}
