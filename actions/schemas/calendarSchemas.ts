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
  
export const createCalendarEventInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  start_time: z.string().datetime("Invalid start time"),
  end_time: z.string().datetime("Invalid end time"),
  all_day: z.boolean().optional().default(false),
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
