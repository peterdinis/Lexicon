import { z } from "zod";

export const createFolderSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255),
});
