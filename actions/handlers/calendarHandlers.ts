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
  data: any, // TODO: Fix me
) {
  const userId = await getUserId();
  const newEvent = {
    id: crypto.randomUUID(),
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...data,
    all_day: data.all_day ? 1 : 0,
  };

  await db.insert(calendarEvents).values(newEvent);
  revalidatePath("/calendar");
  return { ...newEvent, all_day: newEvent.all_day === 1 };
}

// GET SINGLE
export async function getCalendarEventHandler(id: string) {
  const userId = await getUserId();
  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.user_id, userId)));

  if (!event) throw new Error("Event not found");

  return { ...event, all_day: event.all_day === 1 };
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

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined)
    updateData.description = data.description ?? undefined;
  if (data.start_time !== undefined) updateData.start_time = data.start_time;
  if (data.end_time !== undefined) updateData.end_time = data.end_time;
  if (data.color !== undefined) updateData.color = data.color ?? undefined;

  if (data.all_day !== undefined) updateData.all_day = data.all_day ? 1 : 0;

  await db
    .update(calendarEvents)
    .set(updateData)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.user_id, userId)));

  revalidatePath("/calendar");
  return true;
}

// DELETE
export async function deleteCalendarEventHandler(id: string) {
  const userId = await getUserId();
  await db
    .delete(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.user_id, userId)));

  revalidatePath("/calendar");
  return true;
}

// GET ALL
export async function getAllCalendarEventsHandler() {
  const userId = await getUserId();
  const events = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.user_id, userId))
    .orderBy(desc(calendarEvents.created_at));

  return events.map((event) => ({ ...event, all_day: event.all_day === 1 }));
}

// GET BY DATE RANGE
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
        gte(calendarEvents.start_time, startDate),
        lte(calendarEvents.start_time, endDate),
      ),
    )
    .orderBy(calendarEvents.start_time);

  return events.map((event) => ({ ...event, all_day: event.all_day === 1 }));
}
