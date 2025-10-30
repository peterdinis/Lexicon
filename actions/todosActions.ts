"use server";

import { db } from "@/drizzle/db";
import { todos } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Todo } from "@/types/applicationTypes";
import { getUserId } from "@/supabase/get-user-id";
import { CreateTodoInput, createTodoSchema } from "./schemas/todosSchemas";

// Custom types for update operations
interface TodoUpdateData {
  title?: string;
  description?: string | null;
  priority?: "low" | "medium" | "high";
  due_date?: Date | null;
  completed?: boolean;
  status?: string;
  tags?: string | null; // JSON string in database
  notes?: string | null;
  updated_at: Date;
}

interface TodoResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function getTodosAction(): Promise<TodoResponse> {
  try {
    const userId = await getUserId();
    const result = await db
      .select()
      .from(todos)
      .where(eq(todos.user_id, userId));
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return { success: false, error: "Failed to fetch todos" };
  }
}

export async function createTodoAction(
  data: CreateTodoInput,
): Promise<TodoResponse> {
  try {
    // Validate input
    const validatedData = createTodoSchema.parse(data);
    const userId = await getUserId();

    // Create properly typed todo object that matches the schema
    const newTodo = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: validatedData.title,
      description: validatedData.description || null,
      priority: validatedData.priority,
      due_date: validatedData.due_date ? new Date(validatedData.due_date) : null,
      completed: false,
      status: validatedData.status,
      tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
      notes: validatedData.notes || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [result] = await db.insert(todos).values(newTodo).returning();
    revalidatePath("/todos");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create todo:", error);
    return { success: false, error: "Failed to create todo" };
  }
}

export async function updateTodoAction(
  id: string,
  data: Partial<Todo>,
): Promise<TodoResponse> {
  try {
    const userId = await getUserId();

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

    const updateData: TodoUpdateData = {
      updated_at: new Date(),
    };

    // Only update fields that are provided, converting types as needed
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (due_date !== undefined) {
      updateData.due_date = due_date ? new Date(due_date) : null;
    }
    if (completed !== undefined) updateData.completed = completed;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) {
      // Convert array to JSON string for database storage
      updateData.tags = tags ? JSON.stringify(tags) : null;
    }
    if (notes !== undefined) updateData.notes = notes;

    const result = await db
      .update(todos)
      .set(updateData)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Todo not found or unauthorized" };
    }

    revalidatePath("/todos");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating todo:", error);
    return { success: false, error: "Failed to update todo" };
  }
}

export async function deleteTodoAction(id: string): Promise<TodoResponse> {
  try {
    const userId = await getUserId();

    const result = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Todo not found or unauthorized" };
    }

    revalidatePath("/todos");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return { success: false, error: "Failed to delete todo" };
  }
}

// Additional useful actions
export async function toggleTodoAction(id: string): Promise<TodoResponse> {
  try {
    const userId = await getUserId();

    const [currentTodo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)));

    if (!currentTodo) {
      return { success: false, error: "Todo not found" };
    }

    const result = await db
      .update(todos)
      .set({
        completed: !currentTodo.completed,
        updated_at: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)))
      .returning();

    revalidatePath("/todos");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error toggling todo:", error);
    return { success: false, error: "Failed to toggle todo" };
  }
}

export async function getTodoAction(id: string): Promise<TodoResponse> {
  try {
    const userId = await getUserId();

    const [todo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)));

    if (!todo) {
      return { success: false, error: "Todo not found" };
    }

    return { success: true, data: todo };
  } catch (error) {
    console.error("Failed to fetch todo:", error);
    return { success: false, error: "Failed to fetch todo" };
  }
}
