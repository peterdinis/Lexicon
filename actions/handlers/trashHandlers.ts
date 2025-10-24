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

export async function getAllNonTrashedItemsHandler() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  // Správne použitie `and()` namiesto viacerých .where()
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
