"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import { createPageSchema, movePageSchema, pageIdSchema } from "./schemas/pagesSchemas";
import {
  createPageHandler,
  deletePageHandler,
  getAllPagesHandler,
  getPageHandler,
  movePageHandler,
} from "./handlers/pageHandlers";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { pages } from "@/drizzle/schema";

// CREATE
export const createPageAction = actionClient
  .inputSchema(createPageSchema)
  .action(async ({ parsedInput: { title = "Untitled", description = "" } }) => {
    try {
      const result = await createPageHandler(title, description);

      return result;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });
// GET SINGLE
export const getPageAction = actionClient
  .inputSchema(pageIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await getPageHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// UPDATE
export async function updatePageAction(data: {
  id: string;
  title?: string;
  icon?: string;
  description?: string;
  coverImage?: string | null;
}) {
  try {
    const updates: any = {};

    if (data.title !== undefined) updates.title = data.title;
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.description !== undefined) updates.description = data.description;
    if (data.coverImage !== undefined) updates.coverImage = data.coverImage;

    if (Object.keys(updates).length === 0) {
      return { success: false, error: "No valid fields to update" };
    }

    await db.update(pages).set(updates).where(eq(pages.id, data.id));

    console.log("Updating page with data:", updates);

    revalidatePath(`/page/${data.id}`);

    return { success: true };
  } catch (error) {
    console.error("Update page error:", error);
    return { success: false, error: "Failed to update page" };
  }
}

// GET ALL
export const getAllPagesAction = actionClient.action(async () => {
  try {
    const pages = await getAllPagesHandler();
    return pages;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

// DELETE
export const deletePageAction = actionClient
  .inputSchema(pageIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await deletePageHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const movePageAction = actionClient
  .inputSchema(movePageSchema) // Použi novú schému
  .action(async ({ parsedInput: { id, parent_id } }) => {
    try {
      const result = await movePageHandler(id, parent_id);
      revalidatePath("/"); // Revalidate hlavnú stránku kde sú zoznam stránok
      revalidatePath(`/folder/${parent_id}`); // Revalidate cieľový priečinok
      return { success: true, data: result };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });