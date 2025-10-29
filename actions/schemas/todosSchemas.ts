import { z } from "zod";

export const todoIdSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
});

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
});

export const updateTodoSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  completed: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["not_started", "in_progress", "done"]).optional(),
  due_date: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
});

// Schema for toggling completion
export const toggleTodoSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
});

export type CreateTodoSchema = z.infer<typeof createTodoSchema>;
export type UpdateTodoSchema = z.infer<typeof updateTodoSchema>;
export type ToggleTodoSchema = z.infer<typeof toggleTodoSchema>;
