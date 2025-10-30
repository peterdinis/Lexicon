"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import {
  createFolderHandler,
  getFolderDetailHandler,
  getFoldersHandler,
  updateFolderHandler,
  deleteFolderHandler,
} from "./handlers/folderHandlers";
import { revalidatePath } from "next/cache";
import z from "zod";
import { updateFolderInputSchema } from "./schemas/folderSchemas";
import { createFolderSchema, deleteFolderSchema } from "./schemas/todosSchemas";

export const createFolderAction = actionClient
  .inputSchema(createFolderSchema)
  .action(async ({ parsedInput: { parent_id = null, title } }) => {
    try {
      const result = await createFolderHandler(parent_id, title);
      revalidatePath("/dashboard");
      revalidatePath("/page/[id]", "page");
      revalidatePath("/");

      return result;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const getFoldersAction = actionClient.action(async () => {
  try {
    return await getFoldersHandler();
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

export const updateFolderAction = actionClient
  .inputSchema(updateFolderInputSchema.extend({
    id: z.string().uuid("Invalid folder ID"),
  }))
  .action(async ({ parsedInput: { id, title } }) => {
    try {
      const result = await updateFolderHandler(id, { title });
      revalidatePath("/dashboard");
      revalidatePath(`/folder/${id}`);
      revalidatePath("/");
      return { success: true, data: result };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });
// DELETE FOLDER ACTION
export const deleteFolderAction = actionClient
  .inputSchema(deleteFolderSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const result = await deleteFolderHandler(id);
      revalidatePath("/dashboard");
      revalidatePath("/");
      return { success: true, data: result };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const getFolderDetailAction = actionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    try {
      const result = await getFolderDetailHandler(id);
      return { success: true, data: result };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });