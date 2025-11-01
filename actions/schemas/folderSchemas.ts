import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { folders } from "@/drizzle/schema";

export const insertFolderSchema = createInsertSchema(folders, {
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
}).omit({
  user_id: true,
});

export const updateFolderSchema = insertFolderSchema.partial().omit({
  id: true,
  created_at: true,
});

export const createFolderInputSchema = z.object({
  parentId: z.string().uuid("Invalid parent ID").nullable(),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
});

export const updateFolderInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .optional(),
  parent_id: z.uuid("Invalid parent ID").nullable().optional(),
});

export const folderIdSchema = z.object({
  folderId: z.uuid("Invalid folder ID"),
});

export const rawFolderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string().optional().default(""),
  in_trash: z.boolean().optional().default(false),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

export const foldersResponseSchema = z.union([
  z.array(rawFolderSchema),
  z.object({
    data: z.array(rawFolderSchema).optional(),
    success: z.boolean().optional(),
    error: z.string().optional(),
  }),
]);

// Types
export type Folder = z.infer<typeof createSelectSchema>;
export type CreateFolderInput = z.infer<typeof createFolderInputSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderInputSchema>;
