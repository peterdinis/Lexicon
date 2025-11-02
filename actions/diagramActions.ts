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
import {
  createDiagramInputSchema,
  diagramIdSchema,
  updateDiagramInputSchema,
} from "./schemas/diagramsShcemas";
import z from "zod";

export const createDiagramAction = actionClient
  .inputSchema(createDiagramInputSchema)
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

export const getDiagramAction = actionClient
  .inputSchema(diagramIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await getDiagramHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const updateDiagramAction = actionClient
  .inputSchema(
    z.object({
      id: z.string().uuid("Invalid diagram ID"),
      data: updateDiagramInputSchema,
    }),
  )
  .action(async ({ parsedInput: { id, data } }) => {
    try {
      const { nodes, edges, viewport, ...rest } = data;

      const parsedData = {
        ...rest,
        nodes: nodes ? JSON.parse(nodes) : undefined,
        edges: edges ? JSON.parse(edges) : undefined,
        viewport: viewport ? JSON.parse(viewport) : undefined,
      };

      return await updateDiagramHandler(id, parsedData);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const getAllDiagramsAction = actionClient.action(async () => {
  try {
    const diagrams = await getAllDiagramsHandler();
    return diagrams;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});

export const deleteDiagramAction = actionClient
  .inputSchema(diagramIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await deleteDiagramHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const hardDeleteDiagramAction = actionClient
  .inputSchema(diagramIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await hardDeleteDiagramHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const restoreDiagramAction = actionClient
  .inputSchema(diagramIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      return await restoreDiagramHandler(id);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const getTrashedDiagramsAction = actionClient.action(async () => {
  try {
    const diagrams = await getTrashedDiagramsHandler();
    return diagrams;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
});
