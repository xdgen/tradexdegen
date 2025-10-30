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
    recipients,
    onSubmit,
  } = useSendAcademyNotification();

  // Show error state if enrollment fetch failed
  if (enrollmentError) {
    return (
      <Button className="gap-x-2" disabled variant="destructive">
        <MessageSquare className="size-4" />
        Failed to load students
      </Button>
    );
  }

  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-x-2" disabled={isLoadingEnrollments}>
            <MessageSquare className="size-4" />
            {isLoadingEnrollments
              ? "Loading Students..."
              : "Send Message to Students"}
            {!isLoadingEnrollments && recipients.length > 0 && (
              <span className="ml-2 bg-primary/20 px-2 py-1 rounded-full text-xs">
                {recipients.length}
              </span>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent
          showClose={true}
          className="text-white w-full max-w-md sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Send Message to Students</DialogTitle>
            <DialogDescription className="text-gray-400">
              {recipients.length > 0
                ? `Send a message to ${recipients.length} enrolled student${
                    recipients.length !== 1 ? "s" : ""
                  }`
                : "No students enrolled to receive messages"}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Input
                type="text"
                label="Title"
                placeholder="Enter message title..."
                {...register("title")}
                error={errors.title?.message}
                disabled={recipients.length === 0}
              />
            </div>

            <div className="space-y-2">
              <Textarea
                id="message"
                label="Message"
                placeholder={
                  recipients.length > 0
                    ? "Enter your message..."
                    : "No students available to message"
                }
                {...register("message")}
                error={errors.message?.message}
                className="text-white resize-none"
                rows={4}
                disabled={recipients.length === 0}
              />
            </div>

            {recipients.length > 0 && (
              <div className="text-sm text-gray-400">
                This message will be sent to {recipients.length} student
                {recipients.length !== 1 ? "s" : ""}
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValid || isSubmitting || recipients.length === 0}
              isLoading={isSubmitting}
              className="w-full gap-x-2"
              size="lg"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
              <SendIcon className="-rotate-45 !size-5" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendAcademyMessage;
