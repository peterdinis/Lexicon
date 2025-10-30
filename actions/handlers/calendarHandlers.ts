"use server";

import { db } from "@/drizzle/db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/supabase/get-user-id";
import { calendarEvents } from "@/drizzle/schema";
import {
  CreateCalendarEventInput,
  createCalendarEventInputSchema,
  eventIdSchema,
  UpdateCalendarEventInput,
  updateCalendarEventInputSchema,
  dateRangeInputSchema,
} from "../schemas/calendarSchemas";

interface CalendarEventUpdateData {
  title?: string;
  description?: string | null;
  start_time?: Date;
  end_time?: Date;
  color?: string | null;
  all_day?: boolean;
  updated_at: Date;
}

export async function createCalendarEventHandler(
  data: CreateCalendarEventInput,
) {
  // Validate input
  const validatedData = createCalendarEventInputSchema.parse(data);
  const userId = await getUserId();

  const newEvent = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: validatedData.title,
    description: validatedData.description,
    start_time: new Date(validatedData.start_time),
    end_time: new Date(validatedData.end_time),
    all_day: validatedData.all_day ?? false,
    color: validatedData.color,
    in_trash: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const [createdEvent] = await db
    .insert(calendarEvents)
    .values(newEvent)
    .returning();

  revalidatePath("/calendar");
  return createdEvent;
}

export async function getCalendarEventHandler(id: string) {
  // Validate ID
  const { id: validatedId } = eventIdSchema.parse({ id });
  const userId = await getUserId();

  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.id, validatedId),
        eq(calendarEvents.user_id, userId),
        eq(calendarEvents.in_trash, false),
      ),
    );

  if (!event) throw new Error("Event not found");
  return event;
}

export async function updateCalendarEventHandler(
  id: string,
  data: UpdateCalendarEventInput,
) {
  // Validate inputs
  const { id: validatedId } = eventIdSchema.parse({ id });
  const validatedData = updateCalendarEventInputSchema.parse(data);
  const userId = await getUserId();

  const updateData: CalendarEventUpdateData = {
    updated_at: new Date(),
  };

  // Only include fields that are provided
  if (validatedData.title !== undefined) updateData.title = validatedData.title;
  if (validatedData.description !== undefined)
    updateData.description = validatedData.description;
  if (validatedData.start_time !== undefined)
    updateData.start_time = new Date(validatedData.start_time);
  if (validatedData.end_time !== undefined)
    updateData.end_time = new Date(validatedData.end_time);
  if (validatedData.color !== undefined) updateData.color = validatedData.color;
  if (validatedData.all_day !== undefined)
    updateData.all_day = validatedData.all_day;

  const [updatedEvent] = await db
    .update(calendarEvents)
    .set(updateData)
    .where(
      and(
        eq(calendarEvents.id, validatedId),
        eq(calendarEvents.user_id, userId),
      ),
    )
    .returning();

  if (!updatedEvent) throw new Error("Event not found or update failed");
  revalidatePath("/calendar");
  return updatedEvent;
}

export async function deleteCalendarEventHandler(id: string) {
  // Validate ID
  const { id: validatedId } = eventIdSchema.parse({ id });
  const userId = await getUserId();

  const [deletedEvent] = await db
    .update(calendarEvents)
    .set({
      in_trash: true,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(calendarEvents.id, validatedId),
        eq(calendarEvents.user_id, userId),
      ),
    )
    .returning();

  if (!deletedEvent) throw new Error("Event not found or already deleted");
  revalidatePath("/calendar");
  return deletedEvent;
}

export async function hardDeleteCalendarEventHandler(id: string) {
  // Validate ID
  const { id: validatedId } = eventIdSchema.parse({ id });
  const userId = await getUserId();

  const [deletedEvent] = await db
    .delete(calendarEvents)
    .where(
      and(
        eq(calendarEvents.id, validatedId),
        eq(calendarEvents.user_id, userId),
      ),
    )
    .returning();

  if (!deletedEvent) throw new Error("Event not found");
  revalidatePath("/calendar");
  return true;
}

export async function getAllCalendarEventsHandler() {
  const userId = await getUserId();
  const events = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.user_id, userId),
        eq(calendarEvents.in_trash, false),
      ),
    )
    .orderBy(desc(calendarEvents.created_at));

  return events;
}

export async function getCalendarEventsByDateRangeHandler(
  startDate: string,
  endDate: string,
) {
  // Validate date range
  const validatedRange = dateRangeInputSchema.parse({ startDate, endDate });
  const userId = await getUserId();

  const startDateObj = new Date(validatedRange.startDate);
  const endDateObj = new Date(validatedRange.endDate);

  const events = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.user_id, userId),
        eq(calendarEvents.in_trash, false),
        gte(calendarEvents.start_time, startDateObj),
        lte(calendarEvents.start_time, endDateObj),
      ),
    )
    .orderBy(calendarEvents.start_time);

  return events;
}

export async function getCalendarEventsByDateRangeHandlerV2(
  startDate: string,
  endDate: string,
) {
  // Validate date range
  const validatedRange = dateRangeInputSchema.parse({ startDate, endDate });
  const userId = await getUserId();

  const startDateObj = new Date(validatedRange.startDate);
  const endDateObj = new Date(validatedRange.endDate);

  const events = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.user_id, userId),
        eq(calendarEvents.in_trash, false),
        lte(calendarEvents.start_time, endDateObj),
        gte(calendarEvents.end_time, startDateObj),
      ),
    )
    .orderBy(calendarEvents.start_time);

  return events;
}

export async function restoreCalendarEventHandler(id: string) {
  // Validate ID
  const { id: validatedId } = eventIdSchema.parse({ id });
  const userId = await getUserId();

  const [restoredEvent] = await db
    .update(calendarEvents)
    .set({
      in_trash: false,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(calendarEvents.id, validatedId),
        eq(calendarEvents.user_id, userId),
      ),
    )
    .returning();

  if (!restoredEvent) throw new Error("Event not found");
  revalidatePath("/calendar");
  return restoredEvent;
}

export async function getTrashedCalendarEventsHandler() {
  const userId = await getUserId();
  const events = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.user_id, userId),
        eq(calendarEvents.in_trash, true),
      ),
    )
    .orderBy(desc(calendarEvents.updated_at));

  return events;
}