import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { folders } from "@/drizzle/schema";

// Zod Schemas
export const insertFolderSchema = createInsertSchema(folders, {
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
}).omit({
  user_id: true,
});

export const updateFolderSchema = insertFolderSchema.partial().omit({
  id: true,
  created_at: true,
});

// Validation schemas for handlers
export const createFolderInputSchema = z.object({
  parentId: z.string().uuid("Invalid parent ID").nullable(),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
});

export const updateFolderInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
  parent_id: z.string().uuid("Invalid parent ID").nullable().optional(),
});

export const folderIdSchema = z.object({
  folderId: z.string().uuid("Invalid folder ID"),
});

// Types
export type Folder = z.infer<typeof createSelectSchema>;
export type CreateFolderInput = z.infer<typeof createFolderInputSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderInputSchema>;