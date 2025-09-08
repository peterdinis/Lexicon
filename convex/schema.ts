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
    updatedAt: v.optional(v.string()),
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

  templates: defineTable({
    name: v.string(),
    content: v.string(),
    userId: v.optional(v.string()),
    isGlobal: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  files: defineTable({
    name: v.string(),
    storageId: v.id("_storage"),
    userId: v.string(),
    size: v.number(),
    contentType: v.string(),
    uploadedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_storage_id", ["storageId"]),
});
