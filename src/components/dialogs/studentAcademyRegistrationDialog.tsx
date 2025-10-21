import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useStudentRegistration } from "../../hooks/forms/useAcademyForm";
import { Input } from "../ui/input";
import { useAcademy } from "../../hooks/useAcademy";
import { useCheckUserRole } from "../../provider/UserRoleProvider";
import { toast } from "sonner";

const StudentAcademyRegisterDialog = ({
  isOpen,
  closeDialog,
}: {
  isOpen: boolean;
  closeDialog: () => void;
}) => {
  const {
    form: {
      handleSubmit,
      register,
      formState: { errors, isValid, isSubmitting },
    },
  } = useStudentRegistration();
  const { createStudent } = useAcademy();
  const { updateUserRole } = useCheckUserRole();

  console.log(isOpen)

  const handleStudentForm = async (data: { xHandle: string }) => {
    try {
      // Create student on-chain
      await createStudent.mutateAsync({
        twitterHandle: data.xHandle
      });

      // Update user role to STUDENT
      updateUserRole("STUDENT");

      // Close the dialog
      closeDialog();
      console.log(data)
    } catch (error) {
      console.error("Error in student registration:", error);
      toast.error("Failed to register as student");
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showClose={false}
      >
        <DialogHeader>
          <DialogTitle>Set necessary detail</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleStudentForm)}
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
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAcademyRegisterDialog;
