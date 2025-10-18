"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import { createPageSchema, pageIdSchema } from "./schemas/pagesSchemas";
import { createPageHandler, getPageHandler } from "./handlers/pageHandlers";

export const createPageAction = actionClient
  .inputSchema(createPageSchema)
  .action(async ({ parsedInput: { title = "Untitled", description = "" } }) => {
    try {
      return await createPageHandler(title, description);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const getPageAction = actionClient
  .inputSchema(pageIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await getPageHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });
