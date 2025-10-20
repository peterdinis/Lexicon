import { z } from "zod";

export const createFolderSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
});
