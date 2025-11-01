import z from "zod";

export const exchangeCodeSchema = z.object({
  code: z.string().min(1),
  next: z.string().optional(),
  type: z.enum(["recovery", "login"]).optional(),
});

export const checkEmailSchema = z.object({
  email: z.email("Invalid email address"),
});
