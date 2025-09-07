import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFiles = query({
  handler: async (ctx) => {
    const files = await ctx.db.system.query("_storage").collect();

    const result = await Promise.all(
      files.map(async (file) => {
        const url = await ctx.storage.getUrl(file._id);
        return {
          id: file._id,
          size: file.size,
          contentType: file.contentType,
          url,
        };
      })
    );

    return result;
  },
});
