import { z } from "zod";

export const createDiagramSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  nodes: z.string().optional(),
  edges: z.string().optional(),
  viewport: z.string().optional(),
});

export const diagramIdSchema = z.object({
  id: z.string(),
});

export const updateDiagramSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  nodes: z.string().optional(),
  edges: z.string().optional(),
  viewport: z.string().optional(),
});
