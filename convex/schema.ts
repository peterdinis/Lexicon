import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pages: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentPage: v.optional(v.id("pages")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    isDeleted: v.optional(v.boolean()),
    isRestored: v.optional(v.boolean()),
    workspaceId: v.optional(v.id("workspaces")),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentPage"])
    .index("by_workspace", ["workspaceId"]),

  workspaces: defineTable({
    name: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    isDeleted: v.optional(v.boolean()),
    isRestored: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),
});
