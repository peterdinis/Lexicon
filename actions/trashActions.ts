"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import { getAllNonTrashedItemsHandler, restoreFromTrashHandler } from "./handlers/trashHandlers";

export const getAllNonTrashedItemsAction = actionClient.action(async () => {
  try {
    const items = await getAllNonTrashedItemsHandler();
    return items;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

export async function restoreFromTrashAction(formData: FormData) {
  const id = formData.get("id") as string;
  const table = formData.get("table") as string;

  if (!id || !table) {
    return { success: false, error: "Missing ID or table name" };
  }

  try {
    await restoreFromTrashHandler(table, id);
    return { success: true };
  } catch (error: any) {
    console.error("Restore error:", error);
    return { success: false, error: error.message };
  }
}