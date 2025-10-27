"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import {
  createFolderHandler,
  getFoldersHandler,
} from "./handlers/folderHandlers";
import { createFolderSchema } from "./schemas/folderSchemas";
import { revalidatePath } from "next/cache";

export const createFolderAction = actionClient
  .inputSchema(createFolderSchema)
  .action(async ({ parsedInput: { parent_id = null, title } }) => {
    try {
      const result = await createFolderHandler(parent_id, title);
      
      // Revalidácia ciest kde sa zobrazujú foldery
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