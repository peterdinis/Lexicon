"use server";

import { actionClient } from "@/lib/safe-action";
import { getErrorMessage } from "@/constants/applicationConstants";
import {
  createCalendarEventHandler,
  getCalendarEventHandler,
  updateCalendarEventHandler,
  deleteCalendarEventHandler,
  getAllCalendarEventsHandler,
  getCalendarEventsByDateRangeHandler,
} from "./handlers/calendarHandlers";
import { z } from "zod";

const CreateCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  all_day: z.boolean().default(false),
  color: z.string().optional().nullable(),
});

const UpdateCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  start_time: z.string().min(1, "Start time is required").optional(),
  end_time: z.string().min(1, "End time is required").optional(),
  all_day: z.boolean().default(false).optional(),
  color: z.string().optional().nullable(),
});

export const createCalendarEventAction = actionClient
  .inputSchema(CreateCalendarEventSchema)
  .action(async ({ parsedInput }) => {
    try {
      return await createCalendarEventHandler(parsedInput);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// GET SINGLE
export const getCalendarEventAction = actionClient
  .inputSchema(
    z.object({
      id: z.string().min(1, "ID is required"),
    }),
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await getCalendarEventHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// UPDATE
export const updateCalendarEventAction = actionClient
  .inputSchema(
    UpdateCalendarEventSchema.extend({
      id: z.string().min(1, "ID is required"),
    }),
  )
  .action(async ({ parsedInput: { id, ...data } }) => {
    try {
      return await updateCalendarEventHandler(id, data);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// DELETE
export const deleteCalendarEventAction = actionClient
  .inputSchema(
    z.object({
      id: z.string().min(1, "ID is required"),
    }),
  )
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await deleteCalendarEventHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// GET ALL
export const getAllCalendarEventsAction = actionClient.action(async () => {
  try {
    return await getAllCalendarEventsHandler();
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

// GET BY DATE RANGE
export const getCalendarEventsByDateRangeAction = actionClient
  .inputSchema(
    z.object({
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
    }),
  )
  .action(async ({ parsedInput: { startDate, endDate } }) => {
    try {
      return await getCalendarEventsByDateRangeHandler(startDate, endDate);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });
