"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import {
  createDiagramHandler,
  getDiagramHandler,
  updateDiagramHandler,
  getAllDiagramsHandler,
  deleteDiagramHandler,
  hardDeleteDiagramHandler,
  restoreDiagramHandler,
  getTrashedDiagramsHandler,
} from "./handlers/diagramsHandlers";
import { createDiagramSchema, diagramIdSchema, updateDiagramSchema } from "./schemas/diagramsShcemas";

// CREATE
export const createDiagramAction = actionClient
  .inputSchema(createDiagramSchema)
  .action(
    async ({
      parsedInput: {
        title = "Untitled Diagram",
        description = "",
        nodes = [],
        edges = [],
        viewport = { x: 0, y: 0, zoom: 1 },
      },
    }) => {
      try {
        return await createDiagramHandler(
          title,
          description,
          nodes,
          edges,
          viewport,
        );
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
  );

// GET SINGLE
export const getDiagramAction = actionClient
  .inputSchema(diagramIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await getDiagramHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// UPDATE
export const updateDiagramAction = actionClient
  .inputSchema(updateDiagramSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id, ...data } = parsedInput;
      return await updateDiagramHandler(id, data);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// GET ALL
export const getAllDiagramsAction = actionClient.action(async () => {
  try {
    const diagrams = await getAllDiagramsHandler();
    return diagrams;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

// DELETE (Soft Delete - Move to trash)
export const deleteDiagramAction = actionClient
  .inputSchema(diagramIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await deleteDiagramHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// HARD DELETE (Permanent)
export const hardDeleteDiagramAction = actionClient
  .inputSchema(diagramIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await hardDeleteDiagramHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// RESTORE FROM TRASH
export const restoreDiagramAction = actionClient
  .inputSchema(diagramIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await restoreDiagramHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// GET TRASHED DIAGRAMS
export const getTrashedDiagramsAction = actionClient.action(async () => {
  try {
    const diagrams = await getTrashedDiagramsHandler();
    return diagrams;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});