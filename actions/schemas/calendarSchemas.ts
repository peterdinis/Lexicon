import { z } from "zod";

// CREATE
export const createCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  all_day: z.boolean().default(false),
  color: z.string().optional(),
});

// UPDATE (partial)
export const updateCalendarEventSchema = createCalendarEventSchema.partial();

// TYPES
export type CreateCalendarEventSchema = z.infer<
  typeof createCalendarEventSchema
>;
export type UpdateCalendarEventSchema = z.infer<
  typeof updateCalendarEventSchema
>;
