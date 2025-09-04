import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPage = mutation({
  args: {
    title: v.string(),
    userId: v.string(),
    isArchived: v.optional(v.boolean()),
    parentPage: v.optional(v.id("pages")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const pageId = await ctx.db.insert("pages", {
      title: args.title,
      userId: args.userId,
      isArchived: args.isArchived ?? false,
      parentPage: args.parentPage,
      content: args.content ?? "",
      coverImage: args.coverImage,
      icon: args.icon,
      isPublished: args.isPublished ?? false,
      workspaceId: args.workspaceId,
    });

    return pageId;
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const pages = await ctx.db
      .query("pages")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return pages;
  },
});