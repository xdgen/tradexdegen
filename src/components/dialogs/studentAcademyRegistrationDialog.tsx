import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useStudentRegistration } from "../../hooks/forms/useAcademyForm";
import { Input } from "../ui/input";

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
    onSubmit,
  } = useStudentRegistration();

  const handleStudentForm = () => {
    // updateUserRole();
    closeDialog();
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
          onSubmit={handleSubmit((data) => onSubmit(data, handleStudentForm))}
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
