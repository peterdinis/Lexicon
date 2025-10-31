import { db } from "@/drizzle/db";
import { diagrams } from "@/drizzle/schema";
import { getUserId } from "@/supabase/get-user-id";
import { randomUUID } from "crypto";
import { eq, asc, and } from "drizzle-orm";
import {
  createDiagramInputSchema,
  diagramIdSchema,
  updateDiagramInputSchema,
} from "../schemas/diagramsShcemas";
import { revalidatePath } from "next/cache";
import { DiagramNode, DiagramEdge, DiagramViewport } from "@/types/diagramsTypes";

// ----------------------
// Get Single Diagram
// ----------------------
export async function getDiagramHandler(id: string) {
  const userId = await getUserId();

  const [diagram] = await db
    .select()
    .from(diagrams)
    .where(
      and(
        eq(diagrams.id, id),
        eq(diagrams.user_id, userId), // Add user ownership check
      ),
    );

  if (!diagram) throw new Error("Diagram not found");
  return diagram;
}

export async function createDiagramHandler(
  title: string = "Untitled Diagram",
  description: string = "",
  nodes: DiagramNode[] = [],
  edges: DiagramEdge[] = [],
  viewport: DiagramViewport = { x: 0, y: 0, zoom: 1 },
) {
  // Validate input
  const validatedData = createDiagramInputSchema.parse({
    title,
    description,
    nodes,
    edges,
    viewport,
  });

  const userId = await getUserId();

  const [newDiagram] = await db
    .insert(diagrams)
    .values({
      id: randomUUID(),
      user_id: userId,
      title: validatedData.title,
      description: validatedData.description,
      nodes: validatedData.nodes,
      edges: validatedData.edges,
      viewport: validatedData.viewport,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  if (!newDiagram) throw new Error("Failed to create diagram");

  revalidatePath("/diagrams");
  return newDiagram;
}

export async function updateDiagramHandler(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    nodes?: DiagramNode[];
    edges?: DiagramEdge[];
    viewport?: DiagramViewport;
  },
) {
  // Validate inputs
  const { id: validatedId } = diagramIdSchema.parse({ id });
  const validatedData = updateDiagramInputSchema.parse(data);
  const userId = await getUserId();

  const updateData: {
    updated_at: Date;
    title?: string;
    description?: string | null;
    nodes?: DiagramNode[];
    edges?: DiagramEdge[];
    viewport?: DiagramViewport;
  } = {
    updated_at: new Date(),
  };

  // Only include fields that are provided
  if (validatedData.title !== undefined) updateData.title = validatedData.title;
  if (validatedData.description !== undefined)
    updateData.description = validatedData.description;
  if (validatedData.nodes !== undefined) updateData.nodes = validatedData.nodes;
  if (validatedData.edges !== undefined) updateData.edges = validatedData.edges;
  if (validatedData.viewport !== undefined)
    updateData.viewport = validatedData.viewport;

  const [updatedDiagram] = await db
    .update(diagrams)
    .set(updateData)
    .where(and(eq(diagrams.id, validatedId), eq(diagrams.user_id, userId)))
    .returning();

  if (!updatedDiagram) throw new Error("Diagram not found or unauthorized");

  revalidatePath("/diagrams");
  return updatedDiagram;
}

// ----------------------
// Get All Diagrams
// ----------------------
export async function getAllDiagramsHandler() {
  const userId = await getUserId();

  const allDiagrams = await db
    .select()
    .from(diagrams)
    .where(
      and(
        eq(diagrams.user_id, userId),
        eq(diagrams.in_trash, false), // Exclude trashed diagrams
      ),
    )
    .orderBy(asc(diagrams.created_at));

  return allDiagrams || [];
}

// ----------------------
// Soft Delete Diagram (Move to trash)
// ----------------------
export async function deleteDiagramHandler(id: string) {
  const userId = await getUserId();

  const [deletedDiagram] = await db
    .update(diagrams)
    .set({
      in_trash: true,
      updated_at: new Date(),
    })
    .where(and(eq(diagrams.id, id), eq(diagrams.user_id, userId)))
    .returning();

  if (!deletedDiagram) throw new Error("Diagram not found or unauthorized");

  return { success: true, diagram: deletedDiagram };
}

// ----------------------
// Hard Delete Diagram (Permanent)
// ----------------------
export async function hardDeleteDiagramHandler(id: string) {
  const userId = await getUserId();

  const [deletedDiagram] = await db
    .delete(diagrams)
    .where(and(eq(diagrams.id, id), eq(diagrams.user_id, userId)))
    .returning();

  if (!deletedDiagram) throw new Error("Diagram not found or unauthorized");

  return { success: true };
}

// ----------------------
// Restore Diagram from Trash
// ----------------------
export async function restoreDiagramHandler(id: string) {
  const userId = await getUserId();

  const [restoredDiagram] = await db
    .update(diagrams)
    .set({
      in_trash: false,
      updated_at: new Date(),
    })
    .where(and(eq(diagrams.id, id), eq(diagrams.user_id, userId)))
    .returning();

  if (!restoredDiagram) throw new Error("Diagram not found or unauthorized");

  return { success: true, diagram: restoredDiagram };
}

// ----------------------
// Get Trashed Diagrams
// ----------------------
export async function getTrashedDiagramsHandler() {
  const userId = await getUserId();

  const trashedDiagrams = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.user_id, userId), eq(diagrams.in_trash, true)))
    .orderBy(asc(diagrams.updated_at));

  return trashedDiagrams || [];
}
