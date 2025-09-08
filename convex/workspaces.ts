import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Workspace name is required");
    }
    if (args.name.length > 100) {
      throw new Error("Workspace name must be 100 characters or less");
    }

    const existingWorkspace = await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingWorkspace) {
      throw new Error("A workspace with this name already exists");
    }

    const workspace = await ctx.db.insert("workspaces", {
      name: args.name.trim(),
      userId,
      description: args.description?.trim() || undefined,
    });

    return workspace;
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    return await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const workspace = await ctx.db.get(args.id);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.userId !== identity.subject) {
      throw new Error("Not authorized to access this workspace");
    }

    return workspace;
  },
});

export const listPagesByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.userId !== userId) {
      throw new Error("Not authorized to access this workspace");
    }

    return await ctx.db
      .query("pages")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
  },
});

export const movePageToWorkspace = mutation({
  args: {
    pageId: v.id("pages"),
    targetWorkspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const page = await ctx.db.get(args.pageId);
    if (!page) throw new Error("Page not found");

    if (page.userId !== userId) {
      throw new Error("Not authorized to move this page");
    }

    const workspace = await ctx.db.get(args.targetWorkspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.userId !== userId) {
      throw new Error("Not authorized to move page into this workspace");
    }

    await ctx.db.patch(args.pageId, {
      workspaceId: args.targetWorkspaceId,
    });

    return await ctx.db.get(args.pageId);
  },
});


export const deleteWorkspace = mutation({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const workspace = await ctx.db.get(args.id);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.userId !== identity.subject) {
      throw new Error("Not authorized to delete this workspace");
    }

    // Optionally also delete pages inside the workspace
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.id))
      .collect();

    for (const page of pages) {
      await ctx.db.delete(page._id);
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});