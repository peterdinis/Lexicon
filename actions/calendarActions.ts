// actions/calendarActions.ts
"use server";

import { db } from "@/drizzle/db";
import { calendarEvents } from "@/drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { getSupabaseServerClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ----------------------
// Schemas
// ----------------------
export const createCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  all_day: z.boolean().default(false),
  color: z.string().optional(),
});

export const updateCalendarEventSchema = createCalendarEventSchema.partial();

export type CreateCalendarEventSchema = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventSchema = z.infer<typeof updateCalendarEventSchema>;

// ----------------------
// Utility Functions
// ----------------------
async function getUserId() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ----------------------
// Calendar Actions
// ----------------------
export async function getCalendarEventsAction() {
  try {
    const userId = await getUserId();
    const events = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.user_id, userId))
      .orderBy(desc(calendarEvents.created_at));

    return { 
      success: true, 
      data: events.map(event => ({
        ...event,
        all_day: event.all_day === 1,
      }))
    };
  } catch (error) {
    console.error("Failed to fetch calendar events:", error);
    return { success: false, error: "Failed to fetch calendar events" };
  }
}

export async function getCalendarEventByIdAction(id: string) {
  try {
    const userId = await getUserId();
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.user_id, userId)
        )
      );

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { 
      success: true, 
      data: {
        ...event,
        all_day: event.all_day === 1,
      }
    };
  } catch (error) {
    console.error("Failed to fetch calendar event:", error);
    return { success: false, error: "Failed to fetch calendar event" };
  }
}

export async function createCalendarEventAction(data: CreateCalendarEventSchema) {
  try {
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
    
    return { 
      success: true, 
      data: {
        ...newEvent,
        all_day: newEvent.all_day === 1,
      }
    };
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return { success: false, error: "Failed to create calendar event" };
  }
}

export async function updateCalendarEventAction(
  id: string,
  data: UpdateCalendarEventSchema
) {
  try {
    const userId = await getUserId();
    
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (data.all_day !== undefined) {
      updateData.all_day = data.all_day ? 1 : 0;
    }

    await db
      .update(calendarEvents)
      .set(updateData)
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.user_id, userId)
        )
      );

    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    return { success: false, error: "Failed to update calendar event" };
  }
}

export async function deleteCalendarEventAction(id: string) {
  try {
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
    return { success: true };
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return { success: false, error: "Failed to delete calendar event" };
  }
}

export async function getCalendarEventsByDateRangeAction(
  startDate: string,
  endDate: string
) {
  try {
    const userId = await getUserId();
    
    const events = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.user_id, userId),
          gte(calendarEvents.start_time, startDate),
          lte(calendarEvents.start_time, endDate)
        )
      )
      .orderBy(calendarEvents.start_time);

    return { 
      success: true, 
      data: events.map(event => ({
        ...event,
        all_day: event.all_day === 1,
      }))
    };
  } catch (error) {
    console.error("Failed to fetch calendar events by date range:", error);
    return { success: false, error: "Failed to fetch calendar events by date range" };
  }
}

// Alternativní metoda s SQL výrazem - pokud potřebujete komplexnější dotaz
export async function getCalendarEventsByDateRangeSQLAction(
  startDate: string,
  endDate: string
) {
  try {
    const userId = await getUserId();
    
    const events = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.user_id, userId),
          sql`${calendarEvents.start_time} BETWEEN ${startDate} AND ${endDate}`
        )
      )
      .orderBy(calendarEvents.start_time);

    return { 
      success: true, 
      data: events.map(event => ({
        ...event,
        all_day: event.all_day === 1,
      }))
    };
  } catch (error) {
    console.error("Failed to fetch calendar events by date range:", error);
    return { success: false, error: "Failed to fetch calendar events by date range" };
  }
}

// Pro získání eventů pro konkrétní měsíc
export async function getCalendarEventsByMonthAction(year: number, month: number) {
  try {
    const userId = await getUserId();
    
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0).toISOString(); // Poslední den v měsíci
    
    const events = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.user_id, userId),
          gte(calendarEvents.start_time, startDate),
          lte(calendarEvents.start_time, endDate)
        )
      )
      .orderBy(calendarEvents.start_time);

    return { 
      success: true, 
      data: events.map(event => ({
        ...event,
        all_day: event.all_day === 1,
      }))
    };
  } catch (error) {
    console.error("Failed to fetch calendar events by month:", error);
    return { success: false, error: "Failed to fetch calendar events by month" };
  }
}