import { query, mutation } from "./_generated/server";

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
