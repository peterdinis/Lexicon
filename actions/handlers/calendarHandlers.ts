"use server";

import { db } from "@/drizzle/db";
import { calendarEvents } from "@/drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { getSupabaseServerClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function createCalendarEventHandler(
  data: {
    title: string;
    description?: string | null;
    start_time: string;
    end_time: string;
    all_day?: boolean;
    color?: string | null;
  },
) {
  const userId = await getUserId();
  
  const newEvent = {
    id: crypto.randomUUID(),
    user_id: userId,
    ...data,
    all_day: data.all_day ?? false,
    in_trash: false, // Add missing required field
    created_at: new Date(), // Use Date object instead of string
    updated_at: new Date(), // Use Date object instead of string
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
        eq(calendarEvents.in_trash, false) // Exclude trashed events
      )
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
    start_time?: string;
    end_time?: string;
    all_day?: boolean;
    color?: string | null;
  },
) {
  const userId = await getUserId();

  const updateData: {
    updated_at: Date;
    title?: string;
    description?: string | null;
    start_time?: string;
    end_time?: string;
    all_day?: boolean;
    color?: string | null;
  } = {
    updated_at: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.start_time !== undefined) updateData.start_time = data.start_time;
  if (data.end_time !== undefined) updateData.end_time = data.end_time;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.all_day !== undefined) updateData.all_day = data.all_day;

  const [updatedEvent] = await db
    .update(calendarEvents)
    .set(updateData)
    .where(
      and(
        eq(calendarEvents.id, id), 
        eq(calendarEvents.user_id, userId)
      )
    )
    .returning();

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
      updated_at: new Date()
    })
    .where(
      and(
        eq(calendarEvents.id, id), 
        eq(calendarEvents.user_id, userId)
      )
    )
    .returning();

  revalidatePath("/calendar");
  return deletedEvent;
}

// HARD DELETE (Permanent removal)
export async function hardDeleteCalendarEventHandler(id: string) {
  const userId = await getUserId();
  
  await db
    .delete(calendarEvents)
    .where(
      and(
        eq(calendarEvents.id, id), 
        eq(calendarEvents.user_id, userId)
      )
    );

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
        eq(calendarEvents.in_trash, false)
      )
    )
    .orderBy(desc(calendarEvents.created_at));

  return events;
}

// GET BY DATE RANGE (Exclude trashed events)
export async function getCalendarEventsByDateRangeHandler(
  startDate: string,
  endDate: string,
) {
  const userId = await getUserId();
  const events = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.user_id, userId),
        eq(calendarEvents.in_trash, false),
        gte(calendarEvents.start_time, startDate),
        lte(calendarEvents.start_time, endDate),
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
      updated_at: new Date()
    })
    .where(
      and(
        eq(calendarEvents.id, id), 
        eq(calendarEvents.user_id, userId)
      )
    )
    .returning();

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
        eq(calendarEvents.in_trash, true)
      )
    )
    .orderBy(desc(calendarEvents.updated_at));

  return events;
}