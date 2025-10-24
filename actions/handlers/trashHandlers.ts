"use server";

import { db } from "@/drizzle/db";
import {
  pages,
  blocks,
  folders,
  todos,
  calendarEvents,
  diagrams,
  notifications,
} from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { eq, and } from "drizzle-orm";

async function getUserOrThrow() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  if (!user) throw new Error("Unauthorized");

  return user;
}

export async function getAllNonTrashedItemsHandler() {
  const user = await getUserOrThrow();

  const [
    userPages,
    userBlocks,
    userFolders,
    userTodos,
    userEvents,
    userDiagrams,
    userNotifications,
  ] = await Promise.all([
    db.select().from(pages).where(and(eq(pages.user_id, user.id), eq(pages.in_trash, 0))),
    db.select().from(blocks).where(eq(blocks.in_trash, 0)),
    db.select().from(folders).where(and(eq(folders.user_id, user.id), eq(folders.in_trash, 0))),
    db.select().from(todos).where(and(eq(todos.user_id, user.id), eq(todos.in_trash, 0))),
    db.select().from(calendarEvents).where(and(eq(calendarEvents.user_id, user.id), eq(calendarEvents.in_trash, 0))),
    db.select().from(diagrams).where(and(eq(diagrams.user_id, user.id), eq(diagrams.in_trash, 0))),
    db.select().from(notifications).where(and(eq(notifications.user_id, user.id), eq(notifications.in_trash, 0))),
  ]);

  return {
    pages: userPages,
    blocks: userBlocks,
    folders: userFolders,
    todos: userTodos,
    calendarEvents: userEvents,
    diagrams: userDiagrams,
    notifications: userNotifications,
  };
}

export async function getAllTrashedItemsHandler() {
  const user = await getUserOrThrow();

  const [
    userPages,
    userBlocks,
    userFolders,
    userTodos,
    userEvents,
    userDiagrams,
    userNotifications,
  ] = await Promise.all([
    db.select().from(pages).where(and(eq(pages.user_id, user.id), eq(pages.in_trash, 1))),
    db.select().from(blocks).where(eq(blocks.in_trash, 1)),
    db.select().from(folders).where(and(eq(folders.user_id, user.id), eq(folders.in_trash, 1))),
    db.select().from(todos).where(and(eq(todos.user_id, user.id), eq(todos.in_trash, 1))),
    db.select().from(calendarEvents).where(and(eq(calendarEvents.user_id, user.id), eq(calendarEvents.in_trash, 1))),
    db.select().from(diagrams).where(and(eq(diagrams.user_id, user.id), eq(diagrams.in_trash, 1))),
    db.select().from(notifications).where(and(eq(notifications.user_id, user.id), eq(notifications.in_trash, 1))),
  ]);

  return {
    pages: userPages,
    blocks: userBlocks,
    folders: userFolders,
    todos: userTodos,
    calendarEvents: userEvents,
    diagrams: userDiagrams,
    notifications: userNotifications,
  };
}

export async function restoreFromTrashHandler(tableName: string, id: string) {
  const user = await getUserOrThrow();

  const tablesMap: Record<string, any> = {
    pages,
    blocks,
    folders,
    todos,
    calendar_events: calendarEvents,
    diagrams,
    notifications,
  };

  const table = tablesMap[tableName];
  if (!table) throw new Error(`Unknown table: ${tableName}`);

  await db
    .update(table)
    .set({ in_trash: 0 })
    .where(eq(table.id, id));

  return { success: true, restoredId: id };
}
