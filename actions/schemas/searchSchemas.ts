import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().min(1, "Query must be at least 1 character long"),
  limit: z.number().min(1).max(100).default(20),
  types: z
    .array(z.enum(["pages", "todos", "events", "diagrams", "folders"]))
    .default(["pages", "todos", "events", "diagrams", "folders"]),
});

export const quickSearchSchema = z.object({
  query: z.string().min(1, "Query must be at least 1 character long"),
});

export type SearchInput = z.infer<typeof searchSchema>;
export type QuickSearchInput = z.infer<typeof quickSearchSchema>;
