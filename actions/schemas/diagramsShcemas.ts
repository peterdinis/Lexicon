import z from "zod";

export const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.any()
});

// Base edge schema for validation
export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
});

// Viewport schema
export const viewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

// Diagram ID Schema
export const diagramIdSchema = z.object({
  id: z.string().uuid(),
});

// Create Diagram Schema
export const createDiagramSchema = z.object({
  title: z.string().min(1).max(255).default("Untitled Diagram"),
  description: z.string().max(1000).default(""),
  nodes: z.array(nodeSchema).default([]),
  edges: z.array(edgeSchema).default([]),
  viewport: viewportSchema.default({ x: 0, y: 0, zoom: 1 }),
});

// Update Diagram Schema
export const updateDiagramSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  nodes: z.array(nodeSchema).optional(),
  edges: z.array(edgeSchema).optional(),
  viewport: viewportSchema.optional(),
});