import { cn } from "../../lib/utils";
import { useUserRole } from "../../hooks/forms/useUserRole";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { UserRoleSchemaType } from "@/lib/schemas/community.schema";
import { Button } from "../ui/button";

const roles: Role[] = [
  {
    title: "academy",
    description: "Create lessons, share insights, and guide students.",
  },
  {
    title: "student",
    description: "Learn degen strategies, complete lessons, and track progress",
  },
];

const SetUserRoleDialog = ({
  isOpen,
  closeDialog,
}: {
  isOpen: boolean;
  closeDialog: () => void;
}) => {
  const { form, onSubmit } = useUserRole();
  const role = form.watch("role");

  console.log("Role:", role, form.formState.isValid, form.getValues(), role);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showClose={false}
      >
        <DialogHeader>
          <DialogTitle>Choose Role</DialogTitle>
          <DialogDescription>
            Select your role to start your degen trading journey.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((data) => onSubmit(data, closeDialog))}
          className="grid gap-4 py-3"
        >
          <RadioGroup
            onValueChange={(value) =>
              form.setValue("role", value as UserRoleSchemaType["role"])
            }
            value={role}
            className="space-y-1"
          >
            {roles.map(({ title, description }) => (
              <label
                htmlFor={title}
                key={title}
                className={cn(
                  "w-full flex items-center py-2 px-4 border rounded-lg hover:bg-gray-600/5 cursor-pointer border-zinc-800/90 hover:border-primary transition-all duration-300"
                )}
              >
                <RadioGroupItem
                  value={title}
                  id={title}
                  className={cn(
                    "mr-4 size-6",
                    title === role ? "border-primary" : "border-gray-400"
                  )}
                />
                <div>
                  <p className="font-medium capitalize">{title}</p>
                  <p className="text-sm text-gray-600 select-none">
                    {description}
                  </p>
                </div>
              </label>
            ))}
          </RadioGroup>

          <Button type="submit" disabled={role === undefined} className="h-12">
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetUserRoleDialog;
