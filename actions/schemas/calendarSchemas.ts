import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { calendarEvents } from "@/drizzle/schema";

export const insertCalendarEventSchema = createInsertSchema(calendarEvents, {
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  start_time: z.date(),
  end_time: z.date(),
  color: z.string().optional().nullable(),
}).omit({
  user_id: true,
});

export const updateCalendarEventSchema = insertCalendarEventSchema
  .partial()
  .omit({
    id: true,
    created_at: true,
  });

// Alebo ak potrebuješ ISO formát, pridaj transformáciu:
export const createCalendarEventInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  start_time: z
    .string()
    .min(1, "Start time is required")
    .transform((val) => {
      try {
        return new Date(val).toISOString();
      } catch {
        return val;
      }
    }),
  end_time: z
    .string()
    .min(1, "End time is required")
    .transform((val) => {
      try {
        return new Date(val).toISOString();
      } catch {
        return val;
      }
    }),
  all_day: z.boolean().default(false),
  color: z.string().optional().nullable(),
});

export const updateCalendarEventInputSchema =
  createCalendarEventInputSchema.partial();

export const dateRangeInputSchema = z.object({
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
});

export const eventIdSchema = z.object({
  id: z.string().uuid("Invalid event ID"),
});

// Types
export type CreateCalendarEventInput = z.infer<
  typeof createCalendarEventInputSchema
>;
export type UpdateCalendarEventInput = z.infer<
  typeof updateCalendarEventInputSchema
>;
export type DateRangeInput = z.infer<typeof dateRangeInputSchema>;
