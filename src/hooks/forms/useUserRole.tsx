import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserRoleSchemaType,
  userRoleSchema,
} from "../../lib/schemas/community.schema.ts";

export function useUserRole() {
  const form = useForm<UserRoleSchemaType>({
    resolver: zodResolver(userRoleSchema),
    mode: "onChange",
    defaultValues: {
      role: undefined,
    },
  });

  const onSubmit = (data: UserRoleSchemaType, callback: () => void) => {
    console.log(data, "data");
    callback();
  };

  return {
    form,
    onSubmit,
  };
}
