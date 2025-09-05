import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { userId, name, content }) => {
    const id = await ctx.db.insert("templates", {
      userId,
      name,
      content,
    });
    return id;
  },
});