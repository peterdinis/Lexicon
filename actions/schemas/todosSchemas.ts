import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { folders } from "@/drizzle/schema";

// Zod Schemas
export const insertFolderSchema = createInsertSchema(folders, {
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
}).omit({
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z
    .string()
    .max(1000, "Description too long")
    .optional()
    .default(""),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  due_date: z.string().datetime().nullable().optional(),
  status: z.string().optional().default("not_started"),
  tags: z.array(z.string()).optional().default([]), // Frontend sends array
  notes: z.string().optional().default(""),
});

// Validation schemas for actions
export const createFolderSchema = z.object({
  parent_id: z.string().uuid("Invalid parent ID").nullable().default(null),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
});

export const updateFolderInputSchema = z.object({
  id: z.string().uuid("Invalid folder ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .optional(),
  parent_id: z.string().uuid("Invalid parent ID").nullable().optional(),
});

export const deleteFolderSchema = z.object({
  id: z.string().uuid("Invalid folder ID"),
});

// Types
export type Folder = z.infer<typeof createSelectSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderInputSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
