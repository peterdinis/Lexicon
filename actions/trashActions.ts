"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import { getAllNonTrashedItemsHandler } from "./handlers/trashHandlers";

export const getAllNonTrashedItemsAction = actionClient.action(async () => {
  try {
    const items = await getAllNonTrashedItemsHandler();
    return items;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});