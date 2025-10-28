import { MessageSquare } from "lucide-react";
import SendIcon from "@mui/icons-material/Send";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useSendAcademyNotification } from "../../hooks/forms/useAcademyForm";

const SendAcademyMessage = () => {
  const {
    form: {
      handleSubmit,
      register,
      formState: { errors, isValid, isSubmitting },
    },
    isLoadingEnrollments,
    enrollmentError,
    onSubmit,
  } = useSendAcademyNotification();

  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="gap-x-2"
            disabled={isLoadingEnrollments || enrollmentError}
          >
            <MessageSquare className="size-4" />
            Send Message to Students
          </Button>
        </DialogTrigger>

        <DialogContent showClose={true} className="text-white w-1/3 max-w-full">
          <DialogHeader>
            <DialogTitle>Send Message to Students</DialogTitle>
            <DialogDescription>
              Send a message to all enrolled students in your academy
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              type="text"
              label="Title"
              {...register("title")}
              error={errors.title?.message}
            />

            <Textarea
              id="message"
              label="Message"
              placeholder="Enter your message..."
              {...register("message")}
              error={errors.message?.message}
              className="text-white"
              rows={4}
            />
            <Button
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              className="w-full gap-x-2"
              size="lg"
            >
              Send Message
              <SendIcon className="-rotate-45 !size-5" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendAcademyMessage;
