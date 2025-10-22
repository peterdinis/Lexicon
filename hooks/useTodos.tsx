"use client";

import { useState, useEffect } from "react";
import {
  createTodoAction,
  deleteTodoAction,
  getAllTodosAction,
  updateTodoAction,
} from "@/actions/todosActions";

export function useTodos() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await getAllTodosAction();
      if (result.data) setTodos(result.data);
      setLoading(false);
    })();
  }, []);

  const createTodo = async (values: any) => {
    const result = await createTodoAction(values);
    if (result.data) setTodos((prev) => [...prev, result.data]);
  };

  const updateTodo = async (id: string, values: any) => {
    const result = await updateTodoAction({ id, ...values });
    if (result.data)
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? result.data : t))
      );
  };

  const deleteTodo = async (id: string) => {
    await deleteTodoAction({ id });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    todos,
    loading,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}