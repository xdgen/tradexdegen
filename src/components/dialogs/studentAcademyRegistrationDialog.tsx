import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useAcademyApplication } from "../../hooks/forms/useAcademyForm";
import { Input } from "../ui/input";

const StudentAcademyRegisterDialog = ({
  academy,
}: {
  academy: { name: string; fee: number; recipientAddress: string };
}) => {
  const {
    form: {
      handleSubmit,
      register,
      formState: { errors, isValid, isSubmitting },
    },
    onSubmit,
  } = useAcademyApplication();

  return (
    <Dialog>
      <DialogTrigger>
        <button
          className="px-4 py-2 rounded-lg font-semibold transition  bg-gradient-to-r from-fuchsia-500 to-teal-400 text-black hover:brightness-110"
          aria-label="Register for class"
        >
          Register
        </button>
      </DialogTrigger>

      <DialogContent className="w-1/3 max-w-full">
        <DialogHeader>
          <DialogTitle>Become a Student of {academy.name} Academy</DialogTitle>
          <DialogDescription>
            Submit your details to enroll and become part of the learning
            community.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data, {
              recipientAddress: academy.recipientAddress,
              amount: academy.fee,
            })
          )}
          className="h-full grid grid-rows-[1fr_max-content] gap-y-3 overflow-hidden"
        >
          <Input
            type="text"
            label="X handle"
            placeholder="@username"
            {...register("xHandle")}
            error={errors.xHandle?.message}
          />

          <Button
            isLoading={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="w-full rounded-full"
            size="lg"
          >
            Continue to pay {academy.fee} SOL
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAcademyRegisterDialog;
