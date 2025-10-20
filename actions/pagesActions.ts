"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import {
  createPageSchema,
  pageIdSchema,
  updatePageSchema,
} from "./schemas/pagesSchemas";
import {
  createPageHandler,
  deletePageHandler,
  movePageHandler,
  getAllPagesHandler,
  getPageHandler,
  updatePageHandler,
} from "./handlers/pageHandlers";

// CREATE
export const createPageAction = actionClient
  .inputSchema(createPageSchema)
  .action(async ({ parsedInput: { title = "Untitled", description = "" } }) => {
    try {
      return await createPageHandler(title, description);
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
export const updatePageAction = actionClient
  .inputSchema(updatePageSchema)
  .action(async ({ parsedInput: { id, title, description } }) => {
    try {
      return await updatePageHandler(id, { title, description });
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

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
export const deletePageAction = actionClient.inputSchema(pageIdSchema)
  .action(async ({ parsedInput: { id } }) => {
  try {
    return await deletePageHandler(id);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
})