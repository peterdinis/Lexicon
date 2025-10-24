"use server";

import { db } from "@/drizzle/db";
import { todos, todos as todosTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getSupabaseServerClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { CreateTodoSchema } from "./schemas/todosSchemas";
import { Todo } from "@/types/applicationTypes";

async function getUserId() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getTodosAction() {
  try {
    const userId = await getUserId();
    const result = await db
      .select()
      .from(todosTable)
      .where(eq(todosTable.user_id, userId));
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return { success: false, error: "Failed to fetch todos" };
  }
}

export async function createTodoAction(data: CreateTodoSchema) {
  try {
    const userId = await getUserId();
    const newTodo = {
      id: crypto.randomUUID(),
      user_id: userId,
      completed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    await db.insert(todosTable).values(newTodo);
    revalidatePath("/todos");
    return { success: true, data: newTodo };
  } catch (error) {
    console.error("Failed to create todo:", error);
    return { success: false, error: "Failed to create todo" };
  }
}

export async function updateTodoAction(id: string, data: Partial<Todo>) {
  try {
    const {
      title,
      description,
      priority,
      due_date,
      completed,
      status,
      tags,
      notes,
    } = data;

    const result = await db
      .update(todos)
      .set({
        title,
        description,
        priority,
        due_date,
        completed: completed !== undefined ? (completed ? 1 : 0) : undefined,
        status,
        tags: tags ? JSON.stringify(tags) : null,
        notes,
        updated_at: new Date().toISOString(),
      })
      .where(eq(todos.id, id))
      .returning();

    revalidatePath("/todos");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating todo:", error);
    return { success: false, error: "Failed to update todo" };
  }
}

export async function deleteTodoAction(id: string) {
  try {
    const userId = await getUserId();
    await db.delete(todosTable).where(eq(todosTable.id, id));
    revalidatePath("/todos");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return { success: false, error: "Failed to delete todo" };
  }
}