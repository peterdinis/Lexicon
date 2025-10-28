import { z } from "zod";

export const createFolderSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255),
});

export const updateFolderSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
});

export const deleteFolderSchema = z.object({
  id: z.string().min(1, "ID is required"),
});