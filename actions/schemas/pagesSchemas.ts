import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { pages } from "@/drizzle/schema";

// Zod Schemas
export const insertPageSchema = createInsertSchema(pages, {
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").default(""),
  icon: z.string().max(50, "Icon too long").optional(),
  coverImage: z.string().url("Invalid cover image URL").nullable().optional(),
  parent_id: z.string().uuid("Invalid parent ID").nullable().optional(),
  is_folder: z.boolean().default(false),
}).omit({
  user_id: true,
});

export const updatePageSchema = insertPageSchema.partial().omit({
  id: true,
  created_at: true,
});

// Validation schemas for handlers
export const createPageInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .default("Untitled"),
  description: z.string().max(1000, "Description too long").default(""),
  parent_id: z.string().uuid("Invalid parent ID").nullable().default(null),
  is_folder: z.boolean().default(false),
});

export const updatePageInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional(),
  icon: z.string().max(50, "Icon too long").optional(),
  coverImage: z.string().url("Invalid cover image URL").nullable().optional(),
  parent_id: z.string().uuid("Invalid parent ID").nullable().optional(),
});

export const pageIdSchema = z.object({
  id: z.string().uuid("Invalid page ID"),
});

export const movePageInputSchema = z.object({
  parent_id: z.string().uuid("Invalid parent ID").nullable(),
});

export const searchPagesInputSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long"),
});

// Types
export type Page = z.infer<typeof createSelectSchema>;
export type CreatePageInput = z.infer<typeof createPageInputSchema>;
export type UpdatePageInput = z.infer<typeof updatePageInputSchema>;
export type MovePageInput = z.infer<typeof movePageInputSchema>;
