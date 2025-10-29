"use server";

import { db } from "@/drizzle/db";
import { calendarEvents } from "@/drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/supabase/get-user-id";

export async function createCalendarEventHandler(data: {
  title: string;
  description?: string | null;
  start_time: string; // ISO string from client
  end_time: string; // ISO string from client
  all_day?: boolean;
  color?: string | null;
}) {
  const userId = await getUserId();

  const newEvent = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: data.title,
    description: data.description,
    start_time: new Date(data.start_time), // Convert to Date object
    end_time: new Date(data.end_time), // Convert to Date object
    all_day: data.all_day ?? false,
    color: data.color,
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

// GET SINGLE
export async function getCalendarEventHandler(id: string) {
  const userId = await getUserId();
  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.id, id),
        eq(calendarEvents.user_id, userId),
        eq(calendarEvents.in_trash, false),
      ),
    );

  if (!event) throw new Error("Event not found");

  return event;
}

// UPDATE
export async function updateCalendarEventHandler(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    start_time?: string; // ISO string from client
    end_time?: string; // ISO string from client
    all_day?: boolean;
    color?: string | null;
  },
) {
  const userId = await getUserId();

  const updateData: any = {
    updated_at: new Date(),
  };

  // Only include fields that are provided
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.start_time !== undefined)
    updateData.start_time = new Date(data.start_time);
  if (data.end_time !== undefined)
    updateData.end_time = new Date(data.end_time);
  if (data.color !== undefined) updateData.color = data.color;
  if (data.all_day !== undefined) updateData.all_day = data.all_day;

  const [updatedEvent] = await db
    .update(calendarEvents)
    .set(updateData)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.user_id, userId)))
    .returning();

  if (!updatedEvent) throw new Error("Event not found or update failed");

  revalidatePath("/calendar");
  return updatedEvent;
}

// DELETE (Soft delete using in_trash)
export async function deleteCalendarEventHandler(id: string) {
  const userId = await getUserId();

  const [deletedEvent] = await db
    .update(calendarEvents)
    .set({
      in_trash: true,
      updated_at: new Date(),
    })
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.user_id, userId)))
    .returning();

  if (!deletedEvent) throw new Error("Event not found or already deleted");

  revalidatePath("/calendar");
  return deletedEvent;
}

// HARD DELETE (Permanent removal)
export async function hardDeleteCalendarEventHandler(id: string) {
  const userId = await getUserId();

  const [deletedEvent] = await db
    .delete(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.user_id, userId)))
    .returning();

  if (!deletedEvent) throw new Error("Event not found");

  revalidatePath("/calendar");
  return true;
}

// GET ALL (Exclude trashed events)
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

// GET BY DATE RANGE (Exclude trashed events) - FIXED
export async function getCalendarEventsByDateRangeHandler(
  startDate: string, // ISO string
  endDate: string, // ISO string
) {
  const userId = await getUserId();

  // Convert to Date objects for proper timestamp comparison
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

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

// GET BY DATE RANGE - ALTERNATIVE VERSION (if you need to query across both start and end times)
export async function getCalendarEventsByDateRangeHandlerV2(
  startDate: string,
  endDate: string,
) {
  const userId = await getUserId();

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // This version finds events that overlap with the date range
  const events = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.user_id, userId),
        eq(calendarEvents.in_trash, false),
        // Event starts before the range ends AND ends after the range starts
        lte(calendarEvents.start_time, endDateObj),
        gte(calendarEvents.end_time, startDateObj),
      ),
    )
    .orderBy(calendarEvents.start_time);

  return events;
}

// RESTORE FROM TRASH
export async function restoreCalendarEventHandler(id: string) {
  const userId = await getUserId();

  const [restoredEvent] = await db
    .update(calendarEvents)
    .set({
      in_trash: false,
      updated_at: new Date(),
    })
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.user_id, userId)))
    .returning();

  if (!restoredEvent) throw new Error("Event not found");

  revalidatePath("/calendar");
  return restoredEvent;
}

// GET TRASHED EVENTS
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
