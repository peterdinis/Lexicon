"use server";

import { db } from "@/drizzle/db";
import { folders, todos } from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { eq, and, desc, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

// Custom types for todo operations
interface CreateTodoData {
  title: string;
  description?: string;
  priority?: string;
  due_date?: Date | null;
  status?: string;
  notes?: string;
  tags?: string;
}

interface UpdateTodoData {
  title?: string;
  description?: string;
  priority?: string;
  due_date?: Date | null;
  status?: string;
  completed?: boolean;
  notes?: string;
  tags?: string;
  updated_at: Date;
}

// ----------------------
// TODO HANDLERS
// ----------------------

// CREATE TODO
export async function createTodoHandler(data: CreateTodoData) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const id = nanoid();
  const newTodo = {
    id,
    user_id: user.id,
    title: data.title,
    description: data.description ?? "",
    priority: data.priority ?? "low",
    status: data.status ?? "pending",
    due_date: data.due_date,
    notes: data.notes ?? "",
    tags: data.tags ?? "",
    completed: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const [createdTodo] = await db.insert(todos).values(newTodo).returning();

  return createdTodo;
}

// GET SINGLE TODO
export async function getTodoHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [todo] = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.id, id),
        eq(todos.user_id, user.id),
      ),
    );

  if (!todo) throw new Error("Todo not found");
  return todo;
}

// GET ALL TODOS (for a user)
export async function getAllTodosHandler() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const allTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.user_id, user.id))
    .orderBy(desc(todos.created_at));

  return allTodos;
}

// GET TODOS BY STATUS
export async function getTodosByStatusHandler(status: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const todosList = await db
    .select()
    .from(todos)
    .where(and(eq(todos.user_id, user.id), eq(todos.status, status)))
    .orderBy(asc(todos.due_date));

  return todosList;
}

// UPDATE TODO
export async function updateTodoHandler(
  id: string,
  updates: Omit<UpdateTodoData, 'updated_at'> & { due_date?: Date | string | null }
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const updateData: UpdateTodoData = {
    updated_at: new Date(),
  };

  // Only include fields that are provided
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.completed !== undefined) updateData.completed = updates.completed;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.due_date !== undefined) {
    // Convert string to Date if necessary
    updateData.due_date = updates.due_date ? new Date(updates.due_date) : null;
  }

  const [updatedTodo] = await db
    .update(todos)
    .set(updateData)
    .where(
      and(
        eq(todos.id, id),
        eq(todos.user_id, user.id),
      ),
    )
    .returning();

  if (!updatedTodo) throw new Error("Todo not found or unauthorized");
  return updatedTodo;
}

// DELETE TODO
export async function deleteTodoHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [deletedTodo] = await db
    .delete(todos)
    .where(
      and(
        eq(todos.id, id),
        eq(todos.user_id, user.id),
      ),
    )
    .returning();

  if (!deletedTodo) throw new Error("Todo not found or unauthorized");

  return { success: true, todo: deletedTodo };
}

// TOGGLE TODO COMPLETION
export async function toggleTodoHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [currentTodo] = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.user_id, user.id)));

  if (!currentTodo) throw new Error("Todo not found");

  const [updatedTodo] = await db
    .update(todos)
    .set({
      completed: !currentTodo.completed,
      updated_at: new Date(),
    })
    .where(and(eq(todos.id, id), eq(todos.user_id, user.id)))
    .returning();

  return updatedTodo;
}

// ----------------------
// FOLDER HANDLERS
// ----------------------

// UPDATE FOLDER
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
      updated_at: new Date(),
    })
    .where(
      and(
        eq(folders.id, id),
        eq(folders.user_id, user.id),
        eq(folders.in_trash, false),
      ),
    )
    .returning();

  if (!updatedFolder) throw new Error("Folder not found or unauthorized");
  return updatedFolder;
}

// SOFT DELETE FOLDER (Move to trash)
export async function deleteFolderHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [deletedFolder] = await db
    .update(folders)
    .set({
      in_trash: true,
      updated_at: new Date(),
    })
    .where(and(eq(folders.id, id), eq(folders.user_id, user.id)))
    .returning();

  if (!deletedFolder) throw new Error("Folder not found or unauthorized");
  return deletedFolder;
}

// HARD DELETE FOLDER (Permanent removal)
export async function hardDeleteFolderHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [deletedFolder] = await db
    .delete(folders)
    .where(and(eq(folders.id, id), eq(folders.user_id, user.id)))
    .returning();

  if (!deletedFolder) throw new Error("Folder not found or unauthorized");
  return { success: true, folder: deletedFolder };
}

// RESTORE FOLDER FROM TRASH
export async function restoreFolderHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [restoredFolder] = await db
    .update(folders)
    .set({
      in_trash: false,
      updated_at: new Date(),
    })
    .where(and(eq(folders.id, id), eq(folders.user_id, user.id)))
    .returning();

  if (!restoredFolder) throw new Error("Folder not found or unauthorized");
  return restoredFolder;
}