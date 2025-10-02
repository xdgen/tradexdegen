import { z } from "zod";

export const createAcademySchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title is too long"),
    desc: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description is too long"),
    banner: z.string().url("Invalid banner URL").nonempty("Banner is required"),
    startDate: z.date({ required_error: "Start date is required" }).refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to start of day
        return date >= today;
      },
      { message: "Start date must be today or a future date" }
    ),
    endDate: z.date({ required_error: "End date is required" }),
    plan: z.enum(["free", "paid"], {
      errorMap: () => ({ message: "Choose Free or Paid" }),
    }),
    tutors: z.array(
      z.object({
        value: z.string().min(1, "Item cannot be empty"),
      })
    ),
    payoutWallet: z
      .string({ required_error: "Add a payout wallet" })
      .min(10, "Wallet address is too short")
      .max(100, "Wallet address is too long")
      .optional(),
  })
  .refine((data) => data.endDate.getTime() > data.startDate.getTime(), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      data.endDate.getTime() - data.startDate.getTime() >=
      7 * 24 * 60 * 60 * 1000,
    {
      message: "Academy duration must be at least 1 week",
      path: ["endDate"],
    }
  );

export type CreateAcademyInput = z.infer<typeof createAcademySchema>;
