import CancelIcon from "@mui/icons-material/Cancel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useCreateAcademyForm } from "../../hooks/forms/useAcademyForm";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import DatePicker from "../DatePicker";
import { cn } from "../../lib/utils";
import { Controller } from "react-hook-form";
import FilepondUploader from "../FilepondUploader";
import { FormItem } from "../ui/form";
import { CreateAcademyInput } from "../../lib/schemas/community.schema";
import { useState } from "react";

const CommunityRegisterDialog = () => {
  const {
    form: {
      handleSubmit,
      register,
      setValue,
      formState: { errors, isValid, isSubmitting },
      control,
      watch,
    },
    fields,
    append,
    remove,
    onSubmit,
  } = useCreateAcademyForm();
  const plan = watch("plan");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to close the dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // Function to open the dialog
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button className="!font-bold rounded-[20px]" onClick={openDialog}>
        Create an academy
      </Button>

      <Dialog open={isDialogOpen}>
        <DialogContent className="w-[43%] max-w-full h-[40rem] grid grid-rows-[max-content_1fr] gap-y-5">
          <DialogHeader>
            <DialogTitle>Create XDegen Academy</DialogTitle>
            <DialogDescription>
              Start teaching students by setting up your academy
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(async (data) => onSubmit(data, closeDialog))}
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
              <div className="grid grid-cols-2 gap-3.5">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      label="Start Date"
                      onChange={(value) => field.onChange(value)}
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
                      onChange={(value) => field.onChange(value)}
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

                <div
                  className={cn(
                    "grid gap-2 items-start",
                    fields.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  )}
                >
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col gap-y-2 w-full"
                    >
                      <div className="grid grid-cols-[1fr_max-content] items-center gap-1">
                        <Input
                          {...register(`tutors.${index}.value` as const, {
                            required: true,
                          })}
                          placeholder={`Tutor ${index + 1}`}
                          className="border p-2 rounded flex-1 w-full"
                        />
                        {fields.length !== 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-[#545454] w-max"
                          >
                            <CancelIcon />
                          </button>
                        )}
                      </div>
                      {errors.tutors && errors.tutors[0]?.value?.message && (
                        <span className="text-destructive text-sm">
                          {errors.tutors[0]?.value?.message}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <FormItem>
                <Label data-slot="form-label">Plan</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("plan", value as CreateAcademyInput["plan"])
                  }
                  value={plan}
                >
                  <SelectTrigger className="!h-12">
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
                {errors.plan?.message && (
                  <span className="text-destructive text-sm">
                    {errors.plan?.message}
                  </span>
                )}
              </FormItem>

              {plan && plan.toLowerCase() === "paid" && (
                <div className="">
                  {/* <Input
                  type="text"
                  label="Payout Wallet Address"
                  placeholder="HDSDSD***************"
                  {...register("payoutWallet")}
                  error={errors.payoutWallet?.message}
                  className="mt-0"
                /> */}

                  <Input
                    type="number"
                    label="Fee (SOL)"
                    {...register("fee")}
                    error={errors.fee?.message}
                  />
                </div>
              )}

              <FilepondUploader
                label="Banner"
                setImage={(imageUrl: string) => setValue("banner", imageUrl)}
              />
            </div>

            <Button
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full rounded-full"
              size="lg"
            >
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommunityRegisterDialog;
