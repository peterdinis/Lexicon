import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllTrashed = query({
  args: {},
  handler: async (ctx) => {
    const trashedPages = await ctx.db
      .query("pages")
      .filter((q) => q.eq(q.field("isDeleted"), true))
      .collect();

    const trashedWorkspaces = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("isDeleted"), true))
      .collect();

    return {
      pages: trashedPages,
      workspaces: trashedWorkspaces,
    };
  },
});

export const bulkDeleteTrashed = mutation({
  args: {},
  handler: async (ctx) => {
    const trashedPages = await ctx.db
      .query("pages")
      .filter((q) => q.eq(q.field("isDeleted"), true))
      .collect();

    const trashedWorkspaces = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("isDeleted"), true))
      .collect();

    // Delete pages
    for (const page of trashedPages) {
      await ctx.db.delete(page._id);
    }

    // Delete workspaces
    for (const ws of trashedWorkspaces) {
      await ctx.db.delete(ws._id);
    }

    return {
      pagesDeleted: trashedPages.length,
      workspacesDeleted: trashedWorkspaces.length,
    };
  },
});

export const restorePage = mutation({
  args: { pageId: v.id("pages") },
  handler: async (ctx, { pageId }) => {
    const page = await ctx.db.get(pageId);
    if (!page || !page.isDeleted) {
      throw new Error("Page not found or not deleted");
    }

    await ctx.db.patch(pageId, {
      isDeleted: false,
      isRestored: true,
    });

    return { restored: true, pageId: pageId };
  },
});

export const restoreWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const ws = await ctx.db.get(workspaceId);
    if (!ws || !ws.isDeleted) {
      throw new Error("Workspace not found or not deleted");
    }

    await ctx.db.patch(workspaceId, {
      isDeleted: false,
      isRestored: true,
    });

    return { restored: true, workspaceId: workspaceId };
  },
});
