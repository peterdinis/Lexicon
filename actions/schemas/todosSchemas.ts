import { z } from "zod";

export const todoIdSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
});

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("low"),
  due_date: z.string().optional(),
});

export const updateTodoSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
  title: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().optional(),
});