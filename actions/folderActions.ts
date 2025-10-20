import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import { createFolderHandler } from "./handlers/folderHandlers";
import { createFolderSchema } from "./schemas/folderSchemas";

export const createFolderAction = actionClient
  .inputSchema(createFolderSchema)
  .action(async ({ parsedInput: { parent_id = null } }) => {
    try {
      return await createFolderHandler(parent_id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });