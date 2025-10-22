import { CreateTodoSchema } from "@/actions/schemas/todosSchemas";
import { db } from "@/drizzle/db";
import { useState, useEffect } from "react";
import { todos as todosTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export function useTodos(userId: string) {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Fetch all todos
  // ----------------------------
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const result = await db
        .select()
        .from(todosTable)
        .where(eq(todosTable.user_id, userId));
      setTodos(result);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Create todo
  // ----------------------------
  const createTodo = async (data: CreateTodoSchema) => {
    const newTodo = {
      id: crypto.randomUUID(),
      user_id: userId,
      completed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    await db.insert(todosTable).values(newTodo);
    setTodos((prev) => [newTodo, ...prev]);
  };

  // ----------------------------
  // Update todo
  // ----------------------------
  const updateTodo = async (id: string, data: Partial<CreateTodoSchema>) => {
    await db
      .update(todosTable)
      .set({ ...data, updated_at: new Date().toISOString() })
      .where(eq(todosTable.id, id));

    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...data } : todo)),
    );
  };

  // ----------------------------
  // Delete todo
  // ----------------------------
  const deleteTodo = async (id: string) => {
    await db.delete(todosTable).where(eq(todosTable.id, id));
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchTodos();
  }, [userId]);

  return { todos, loading, createTodo, updateTodo, deleteTodo, fetchTodos };
}
