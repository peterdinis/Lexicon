import z from "zod";

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(50).default(10),
  types: z.array(z.enum(["pages", "blocks", "todos", "events", "diagrams", "folders"])).default(["pages", "blocks", "todos"]),
});