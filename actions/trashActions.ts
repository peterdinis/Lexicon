"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import z from "zod";
import { getAllTrashedItemsHandler, getAllNonTrashedItemsHandler, restoreFromTrashHandler, emptyTrashHandler, getTrashStatsHandler, moveToTrashHandler, permanentlyDeleteHandler } from "./handlers/trashHandlers";

// Get all trashed items for trash page
export const getAllTrashedItemsAction = actionClient.action(async () => {
  try {
    const items = await getAllTrashedItemsHandler();
    return items;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

// Get all non-trashed items for dashboard
export const getAllNonTrashedItemsAction = actionClient.action(async () => {
  try {
    const items = await getAllNonTrashedItemsHandler();
    return items;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

// Move item to trash
export const moveToTrashAction = actionClient
  .inputSchema(
    z.object({
      id: z.string(),
      table: z.enum(["pages", "folders"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, table } = parsedInput;
    try {
      await moveToTrashHandler(table, id);
      return { success: true };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// Restore item from trash
export async function restoreFromTrashAction(formData: FormData) {
  const id = formData.get("id") as string;
  const table = formData.get("table") as "pages" | "folders";

  if (!id || !table) {
    return { success: false, error: "Missing ID or table name" };
  }

  try {
    await restoreFromTrashHandler(table, id);
    return { success: true };
  } catch (error: unknown) {
    console.error("Restore error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return { success: false, error: errorMessage };
  }
}

// Permanently delete item from trash
export async function permanentlyDeleteAction(formData: FormData) {
  const id = formData.get("id") as string;
  const table = formData.get("table") as "pages" | "folders";

  if (!id || !table) {
    return { success: false, error: "Missing ID or table name" };
  }

  try {
    await permanentlyDeleteHandler(table, id);
    return { success: true };
  } catch (error: unknown) {
    console.error("Permanent delete error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return { success: false, error: errorMessage };
  }
}

// Empty entire trash
export const emptyTrashAction = actionClient.action(async () => {
  try {
    await emptyTrashHandler();
    return { success: true };
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

// Get trash statistics
export const getTrashStatsAction = actionClient.action(async () => {
  try {
    const stats = await getTrashStatsHandler();
    return { data: stats };
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});