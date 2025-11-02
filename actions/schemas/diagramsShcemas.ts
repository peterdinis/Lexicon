import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { diagrams } from "@/drizzle/schema";

export const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.any(),
});

export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  data: z.any(),
});

export const viewportSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  zoom: z.number().min(0.1).max(2).default(1),
});

export const insertDiagramSchema = createInsertSchema(diagrams, {
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  nodes: z.array(nodeSchema).default([]),
  edges: z.array(edgeSchema).default([]),
  viewport: viewportSchema.default({ x: 0, y: 0, zoom: 1 }),
}).omit({
  user_id: true,
  deleted_at: true,
});

export const updateDiagramSchema = insertDiagramSchema.partial().omit({
  id: true,
  created_at: true,
});

export const createDiagramInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .default("Untitled Diagram"),
  description: z.string().max(1000, "Description too long").default(""),
  nodes: z.array(nodeSchema).default([]),
  edges: z.array(edgeSchema).default([]),
  viewport: viewportSchema.default({ x: 0, y: 0, zoom: 1 }),
});

export const updateDiagramInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional(),
  nodes: z
    .string()
    .optional()
    .transform((str, ctx) => {
      if (!str) return undefined;
      try {
        return JSON.parse(str);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid nodes JSON",
        });
        return z.NEVER;
      }
    }),
  edges: z
    .string()
    .optional()
    .transform((str, ctx) => {
      if (!str) return undefined;
      try {
        return JSON.parse(str);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid edges JSON",
        });
        return z.NEVER;
      }
    }),
  viewport: z
    .string()
    .optional()
    .transform((str, ctx) => {
      if (!str) return undefined;
      try {
        return JSON.parse(str);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid viewport JSON",
        });
        return z.NEVER;
      }
    }),
});

export const diagramIdSchema = z.object({
  id: z.uuid("Invalid diagram ID"),
});

export type Diagram = z.infer<typeof createSelectSchema>;
export type CreateDiagramInput = z.infer<typeof createDiagramInputSchema>;
export type UpdateDiagramInput = z.infer<typeof updateDiagramInputSchema>;
export type Node = z.infer<typeof nodeSchema>;
export type Edge = z.infer<typeof edgeSchema>;
export type Viewport = z.infer<typeof viewportSchema>;
