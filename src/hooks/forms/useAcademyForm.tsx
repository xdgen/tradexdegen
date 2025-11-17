import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  createAcademySchema,
  CreateAcademyInput,
  AcademyApplicationType,
  academyApplicationSchema,
  SendAcademyNotificationType,
  sendAcademyNotificationSchema,
} from "../../lib/schemas/community.schema.ts";
import { sendSol } from "../../lib/services/solana.ts";
import { toast } from "sonner";
import { dapp, initializeDapp } from "../../lib/services/dialect.ts";
import { Plan, useAcademy } from "../useAcademy.tsx";
import { useAuth } from "../../provider/AuthProvider.tsx";
import { useMemo } from "react";
import { triggerLocalStorageChange } from "../useLocalStorageSubscription.tsx";
import { PublicKey } from "@solana/web3.js";
import { useQueries } from "@tanstack/react-query";

export function useCreateAcademyForm() {
  const { authData } = useAuth();
  const form = useForm<CreateAcademyInput>({
    resolver: zodResolver(createAcademySchema),
    mode: "all",
    defaultValues: {
      title: "",
      desc: "",
      banner: "",
      startDate: undefined,
      endDate: undefined,
      plan: undefined,
      fee: "",
      tutors: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray<CreateAcademyInput>({
    control: form.control,
    name: "tutors",
  } as never);

  const { createAcademy } = useAcademy();

  const onSubmit = async (data: CreateAcademyInput, callback: () => void) => {
    try {
      const tutors = data.tutors.map((tutor) => tutor.value);
      const startDate = Math.floor(data.startDate.getTime() / 1000);
      const endDate = Math.floor(data.endDate.getTime() / 1000);

      const plan: Plan = data.plan == "free" ? { free: {} } : { paid: {} };
      await createAcademy.mutateAsync({
        title: data.title,
        description: data.desc,
        banner: data.banner,
        startDate: startDate,
        endDate: endDate,
        plan: plan,
        fee: data.fee ? Number(data.fee) : null,
        tutors: tutors,
      });

      callback();

      localStorage.setItem(`academy-${authData?.user.id}`, "true");
      triggerLocalStorageChange(`academy-${authData?.user.id}`);
      toast.success(`${data.title} Academy created successfully`);
      form.reset();
    } catch (err) {
      toast.error("Academy creation failed");
    }
  };

  return {
    form,
    fields,
    append,
    remove,
    onSubmit,
  };
}

export function useAcademyApplication() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const form = useForm<AcademyApplicationType>({
    resolver: zodResolver(academyApplicationSchema),
    mode: "all",
    defaultValues: {
      xHandle: "",
    },
  });

  const onSubmit = async (
    data: AcademyApplicationType,
    payload: { recipientAddress: string; amount: number }
  ) => {
    try {
      const signature = await sendSol(
        wallet,
        connection,
        payload.recipientAddress,
        payload.amount
      );

      toast.success(`Payment confirmed! Signature: ${signature}`);

      // Register user to academy
    } catch (err: any) {
      toast.error(err);
    }
  };

  return {
    form,
    onSubmit,
  };
}

export function useStudentRegistration() {
  const form = useForm<AcademyApplicationType>({
    resolver: zodResolver(academyApplicationSchema),
    mode: "all",
    defaultValues: {
      xHandle: "",
    },
  });

  return {
    form,
  };
}

export function useSendAcademyNotification() {
  const { publicKey } = useWallet();
  const { getAcademyEnrollments, getAcademyPDA, program, provider } =
    useAcademy();

  // Get Academy PDA from the authenticated user's wallet
  const academyPDA = useMemo(() => {
    if (!publicKey) return null;

    try {
      return getAcademyPDA(new PublicKey(publicKey));
    } catch (error) {
      console.error("Error creating academy PDA:", error);
      return null;
    }
  }, [publicKey]);

  // Fetch enrollments directly from the contract
  const {
    data: enrollments,
    isLoading: isLoadingEnrollments,
    error,
  } = getAcademyEnrollments(academyPDA!);

  const studentPDAs = useMemo(() => {
    if (!enrollments || enrollments.length === 0) return [];

    const uniquePDAs = new Set<string>();
    const pdas: PublicKey[] = [];

    enrollments.forEach((enrollment) => {
      if (enrollment.account.student) {
        const pdaString = enrollment.account.student.toBase58();
        if (!uniquePDAs.has(pdaString)) {
          uniquePDAs.add(pdaString);
          pdas.push(enrollment.account.student);
        }
      }
    });
    return pdas;
  }, [enrollments]);

  // Fetch student accounts directly using program (not the hook)
  const studentQueries = useQueries({
    queries: studentPDAs.map((pda) => ({
      queryKey: ["student-account", pda.toBase58()],
      queryFn: async () => {
        if (!program || !provider?.wallet?.publicKey) {
          throw new Error("Program not initialized or wallet not connected");
        }

        try {
          const studentAccount = await program.account.student.fetch(pda);

          return {
            pda: pda.toBase58(),
            studentAccount,
          };
        } catch (error) {
          console.error(
            `Error fetching student account for ${pda.toBase58()}:`,
            error
          );
          return {
            pda: pda.toBase58(),
            studentAccount: null,
            wallet: pda.toBase58(),
            error,
          };
        }
      },
      enabled:
        !!program && !!provider?.wallet?.publicKey && studentPDAs.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    })),
  });

  const isLoadingStudents = studentQueries.some((query) => query.isLoading);
  const isLoading = isLoadingEnrollments || isLoadingStudents;

  const form = useForm<SendAcademyNotificationType>({
    resolver: zodResolver(sendAcademyNotificationSchema),
    mode: "all",
    defaultValues: {
      title: "",
      message: "",
    },
  });

  // Extract valid wallet addresses from enrollments
  const recipients = useMemo(() => {
    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    const validWallets = studentQueries
      .map((query) => {
        if (query.data?.studentAccount?.owner.toBase58()) {
          return query.data?.studentAccount?.owner.toBase58();
        }
        return null;
      })
      .filter((wallet): wallet is string => !!wallet);

    // Remove duplicates
    const uniqueWallets = Array.from(new Set(validWallets));

    return uniqueWallets;
  }, [enrollments]);

  const onSubmit: SubmitHandler<SendAcademyNotificationType> = async (data) => {
    if (!recipients.length) {
      toast.error("No students enrolled to receive notifications");
      return;
    }

    if (!dapp) {
      await initializeDapp();
    }

    if (!dapp) {
      toast.error("Failed to initialize Dialect. Please try again.");
      return;
    }

    try {
      await dapp?.messages.send({
        ...data,
        recipients,
      });
      toast.success(
        `Notification sent to ${recipients.length} student${
          recipients.length !== 1 ? "s" : ""
        }`
      );
      form.reset();
    } catch (err: any) {
      toast.error(err);
    }
  };

  return {
    form,
    isLoadingEnrollments: isLoading,
    enrollmentError: error,
    recipients,
    onSubmit,
  };
}
