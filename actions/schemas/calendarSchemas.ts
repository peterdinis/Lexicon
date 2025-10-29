import { z } from "zod";

export const CreateCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  all_day: z.boolean().default(false),
  color: z.string().optional().nullable(),
});

export const UpdateCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  start_time: z.string().min(1, "Start time is required").optional(),
  end_time: z.string().min(1, "End time is required").optional(),
  all_day: z.boolean().default(false).optional(),
  color: z.string().optional().nullable(),
});