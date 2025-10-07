import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  createAcademySchema,
  CreateAcademyInput,
  AcademyApplicationType,
  academyApplicationSchema,
} from "../../lib/schemas/community.schema.ts";
import { sendSol } from "../../lib/services/solana.ts";
import { toast } from "sonner";

export function useCreateAcademyForm() {
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
      payoutWallet: "",
    },
  });

  const { fields, append, remove } = useFieldArray<CreateAcademyInput>({
    control: form.control,
    name: "tutors",
  } as never);

  const onSubmit: SubmitHandler<CreateAcademyInput> = (data) => {
    console.log(data);
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
