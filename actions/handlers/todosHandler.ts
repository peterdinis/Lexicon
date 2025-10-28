"use server";

import { db } from "@/drizzle/db";
import { folders, todos } from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// CREATE
export async function createTodoHandler(
  userId: string,
  data: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
  },
) {
  const id = nanoid();
  await db.insert(todos).values({
    id,
    user_id: userId,
    title: data.title,
    description: data.description ?? "",
    priority: data.priority ?? "low",
    due_date: data.due_date ?? null,
  });
  return { id, ...data };
}

// GET SINGLE
export async function getTodoHandler(id: string) {
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  return todo ?? null;
}

// GET ALL (for a user)
export async function getAllTodosHandler(userId: string) {
  const allTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.user_id, userId))
    .orderBy(todos.created_at);
  return allTodos;
}

// UPDATE
export async function updateTodoHandler(
  id: string,
  updates: Record<string, unknown>,
) {
  await db.update(todos).set(updates).where(eq(todos.id, id));
  const [updated] = await db.select().from(todos).where(eq(todos.id, id));
  return updated;
}

// DELETE
export async function deleteTodoHandler(id: string) {
  await db.delete(todos).where(eq(todos.id, id));
  return { success: true };
}

export async function updateFolderHandler(id: string, title: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [updatedFolder] = await db
    .update(folders)
    .set({
      title,
      updated_at: new Date().toISOString(),
    })
    .where(eq(folders.id, id))
    .returning();

  if (!updatedFolder) throw new Error("Folder not found");

  return updatedFolder;
}

// DELETE FOLDER HANDLER
export async function deleteFolderHandler(id: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [deletedFolder] = await db
    .delete(folders)
    .where(eq(folders.id, id))
    .returning();

  if (!deletedFolder) throw new Error("Folder not found");

  return deletedFolder;
}
