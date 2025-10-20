import z from "zod";

export const pageIdSchema = z.object({
  id: z.string().min(1),
});

export const createPageSchema = z.object({
  title: z.string().optional().default("Untitled"),
  description: z.string().optional().default(""),
});

export const updatePageSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
});
