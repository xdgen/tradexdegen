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
    fee: z
      .string({
        required_error: "Fee amount is required for paid academies",
        invalid_type_error: "Fee must be a valid number",
      })
      .trim()
      .optional()
      .refine(
        (val) => !val || /^[0-9]+(\.[0-9]+)?$/.test(val),
        "Fee must be a valid positive number"
      ),
    tutors: z.array(
      z.object({
        value: z.string().min(1, "Item cannot be empty"),
      })
    ),
    // payoutWallet: z
    //   .string({ required_error: "Add a payout wallet" })
    //   .min(10, "Wallet address is too short")
    //   .max(100, "Wallet address is too long")
    //   .optional(),
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
  )
  .refine(
    (data) => {
      if (data.plan === "paid") {
        return data.fee && parseFloat(data.fee) > 0;
      }
      return true;
    },
    {
      message: "Fee is required and must be greater than 0 for paid academies",
      path: ["fee"],
    }
  )
  .refine(
    (data) => {
      if (data.plan === "free") {
        return !data.fee || parseFloat(data.fee) === 0;
      }
      return true;
    },
    {
      message: "Free academies cannot have a fee",
      path: ["fee"],
    }
  );

export const userRoleSchema = z.object({
  role: z.enum(["ACADEMY", "STUDENT"], {
    errorMap: () => ({ message: "Select a valid role" }),
  }),
});

export const academyApplicationSchema = z.object({
  xHandle: z
    .string({ required_error: "Please input your X handle" })
    .trim()
    .min(4, "Invalid X handle")
    .refine((value) => /^@[A-Za-z0-9_]{1,15}$/.test(value), {
      message: "Enter a valid X handle (e.g. @trader123 or trader_123)",
      path: ["xHandle"],
    }),
});

export const sendAcademyNotificationSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message is too long"),
});

export type CreateAcademyInput = z.infer<typeof createAcademySchema>;
export type UserRoleSchemaType = z.infer<typeof userRoleSchema>;
export type AcademyApplicationType = z.infer<typeof academyApplicationSchema>;
export type SendAcademyNotificationType = z.infer<
  typeof sendAcademyNotificationSchema
>;
