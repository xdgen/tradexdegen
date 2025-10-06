import CancelIcon from "@mui/icons-material/Cancel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { useCreateAcademyForm } from "../hooks/forms/useCreateAcademyForm";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import DatePicker from "./DatePicker";
import { Controller } from "react-hook-form";
import FilepondUploader from "./FilepondUploader";

const CommunityRegisterDialog = () => {
  const {
    form: {
      handleSubmit,
      register,
      setValue,
      formState: { errors, isValid, isSubmitting },
      control,
    },
    fields,
    append,
    remove,
    onSubmit,
  } = useCreateAcademyForm();

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="!font-bold rounded-[20px]">Create an academy</Button>
      </DialogTrigger>

      <DialogContent className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[60%] xl:w-[50%] max-w-4xl h-[90vh] max-h-[40rem] grid grid-rows-[max-content_1fr] gap-y-5">
        <DialogHeader>
          <DialogTitle>Create XDegen Academy</DialogTitle>
          <DialogDescription>
            Start teaching students by setting up your academy
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-full grid grid-rows-[1fr_max-content] gap-y-3 overflow-hidden"
        >
          <div className="space-y-3 overflow-y-auto no-scrollbar">
            <Input
              type="text"
              label="Title"
              {...register("title")}
              error={errors.title?.message}
            />

            <Textarea
              label="Description"
              {...register("desc")}
              error={errors.desc?.message}
              className="resize-none"
            />

            {/* Durations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    label="Start Date"
                    onChange={field.onChange}
                    placeholder="Select start date"
                    error={errors.startDate?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    label="End Date"
                    onChange={field.onChange}
                    placeholder="Select end date"
                    error={errors.endDate?.message}
                  />
                )}
              />
            </div>

            {/* Tutors */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Tutors</Label>
                <button
                  type="button"
                  onClick={() => append({ value: "" })}
                  className="text-blue-500 mt-2 text-sm"
                >
                  + Add Tutor
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 w-full"
                  >
                    <div className="flex-1">
                      <Input
                        {...register(`tutors.${index}.value` as const, {
                          required: true,
                        })}
                        placeholder={`Tutor ${index + 1}`}
                        error={errors.tutors && errors.tutors[0]?.value?.message}
                      />
                    </div>
                    {fields.length !== 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-red-400/10 transition-colors flex-shrink-0"
                        aria-label="Remove tutor"
                      >
                        <CancelIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Free", "Paid"].map((plan) => (
                      <SelectItem key={plan} value={plan.toLowerCase()}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="text"
                label="Payout Wallet Address"
                placeholder="HDSDSD***************"
                {...register("payoutWallet")}
                error={errors.payoutWallet?.message}
              />
            </div>

            <FilepondUploader
              label="Banner"
              setImage={(imageUrl: string) => setValue("banner", imageUrl)}
            />
          </div>

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

export default CommunityRegisterDialog;
