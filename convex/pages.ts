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
    isDeleted: v.optional(v.boolean()),
    isRestored: v.optional(v.boolean()),
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
      isDeleted: args.isDeleted ?? false,
      isRestored: args.isRestored ?? false,
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
      .filter((q) => q.eq(q.field("isDeleted"), false)) // ✅ nezobrazuj vymazané
      .collect();

    return pages;
  },
});

export const getPageById = query({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const pageInfo = await ctx.db.get(args.id);
    if (!pageInfo) throw new Error("Page not found");

    if (pageInfo.isDeleted) {
      throw new Error("Page is deleted");
    }

    return pageInfo;
  },
});

export const updatePage = mutation({
  args: {
    id: v.id("pages"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
    isRestored: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.id);
    if (!page) throw new Error("Page not found");

    await ctx.db.patch(args.id, {
      title: args.title ?? page.title,
      content: args.content ?? page.content,
      coverImage: args.coverImage ?? page.coverImage,
      icon: args.icon ?? page.icon,
      isArchived: args.isArchived ?? page.isArchived,
      isPublished: args.isPublished ?? page.isPublished,
      isDeleted: args.isDeleted ?? page.isDeleted,
      isRestored: args.isRestored ?? page.isRestored,
    });

    return await ctx.db.get(args.id);
  },
});

export const moveToTrash = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, { id }) => {
    const page = await ctx.db.get(id);
    if (!page) throw new Error("Page not found");

    await ctx.db.patch(id, { isDeleted: true, isRestored: false });
    return { success: true, message: "Page moved to trash" };
  },
});

export const restorePage = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, { id }) => {
    const page = await ctx.db.get(id);
    if (!page) throw new Error("Page not found");

    if (!page.isDeleted) {
      throw new Error("Page is not in trash");
    }

    await ctx.db.patch(id, { isDeleted: false, isRestored: true });
    return { success: true, message: "Page restored" };
  },
});