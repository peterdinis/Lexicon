import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    size: v.number(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    await ctx.db.insert("files", {
      name: args.name,
      storageId: args.storageId,
      userId,
      size: args.size,
      contentType: args.contentType,
      uploadedAt: Date.now(),
    });
  },
});

export const getFiles = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const result = await Promise.all(
<<<<<<< HEAD
      files.map(async (file) => {
        const url = await ctx.storage.getUrl(file._id);
        return {
          id: file._id,
          size: file.size,
          contentType: file.contentType,
          url,
        };
      })
=======
      files.map(async (file) => ({
        id: file.storageId,
        fileId: file._id,
        name: file.name,
        size: file.size,
        contentType: file.contentType,
        uploadedAt: file.uploadedAt,
        url: await ctx.storage.getUrl(file.storageId),
      })),
>>>>>>> main
    );

    return result;
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const file = await ctx.db.get(args.fileId);

    if (!file || file.userId !== userId) {
      throw new Error("File not found or access denied");
    }

    // Odstránenie metadát súboru
    await ctx.db.delete(args.fileId);

    // Odstránenie súboru z úložiska
    await ctx.storage.delete(args.storageId);

    return { success: true };
  },
});
