import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAcademySchema,
  CreateAcademyInput,
} from "../../lib/schemas/community.schema.ts";

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
