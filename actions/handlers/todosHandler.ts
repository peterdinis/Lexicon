"use server";

import { db } from "@/drizzle/db";
import { todos } from "@/drizzle/schema";
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
  updates: Record<string, any>,
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
