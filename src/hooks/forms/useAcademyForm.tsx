import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

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
import { dapp } from "../../lib/services/dialect.ts";
import { Plan, useAcademy } from "../useAcademy.tsx";
import { useCheckUserRole } from "../../provider/UserRoleProvider.tsx";
import { axiosAsync } from "../../lib/axios.ts";
import { useMemo } from "react";

export function useCreateAcademyForm() {
  const { authData } = useCheckUserRole();
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
      console.log(data);

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
  const { authData } = useCheckUserRole();
  const {
    data: enrollments,
    isLoading,
    error,
  } = useQuery<APIResponse<EnrollmentWithRelations[]>>({
    queryKey: ["academy-enrollments", authData?.user.id],
    queryFn: async () => {
      try {
        if (!authData?.user.id) return null;

        const response = await axiosAsync(
          `/academies/${authData?.user.id}/enrollments`
        );
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: !!authData?.user.id,
    retry: 2,
  });

  const form = useForm<SendAcademyNotificationType>({
    resolver: zodResolver(sendAcademyNotificationSchema),
    mode: "all",
    defaultValues: {
      title: "",
      message: "",
    },
  });

  const recipients = useMemo(
    () =>
      enrollments?.data
        ? (enrollments.data
            .map((data) => data.student?.user?.wallet)
            .filter(Boolean) as string[])
        : ["6eYUsVivEeKAsf9xb3QeN9MDUP54dgZuyKLk176WbwDM"],
    [enrollments]
  );

  const onSubmit: SubmitHandler<SendAcademyNotificationType> = async (data) => {
    if (!recipients.length) {
      toast.error("No students enrolled to receive notifications");
      return;
    }

    try {
      dapp?.messages.send({
        ...data,
        recipients,
      });
      toast.success("Notification sent to students");
      form.reset();
    } catch (err: any) {
      toast.error(err);
    }
  };

  return {
    form,
    isLoadingEnrollments: isLoading,
    enrollmentError: !!error,
    onSubmit,
  };
}
