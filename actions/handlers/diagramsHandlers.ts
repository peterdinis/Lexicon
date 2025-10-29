import { db } from "@/drizzle/db";
import { diagrams } from "@/drizzle/schema";
import { getUserId } from "@/supabase/get-user-id";
import { randomUUID } from "crypto";
import { eq, asc, and } from "drizzle-orm";

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

// ----------------------
// Create Diagram
// ----------------------
export async function createDiagramHandler(
  title: string = "Untitled Diagram",
  description: string = "",
  nodes: any[] = [], // Accept array/object instead of string
  edges: any[] = [], // Accept array/object instead of string
  viewport: object = { x: 0, y: 0, zoom: 1 }, // Accept object instead of string
) {
  const userId = await getUserId();

  const [newDiagram] = await db
    .insert(diagrams)
    .values({
      id: randomUUID(),
      user_id: userId,
      title,
      description,
      nodes: nodes, // Direct object/array assignment
      edges: edges, // Direct object/array assignment
      viewport: viewport, // Direct object assignment
      created_at: new Date(), // Use Date object
      updated_at: new Date(), // Use Date object
    })
    .returning();

  if (!newDiagram) throw new Error("Failed to create diagram");
  return newDiagram;
}

// ----------------------
// Update Diagram
// ----------------------
export async function updateDiagramHandler(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    nodes: any[]; // Change to any[] instead of string
    edges: any[]; // Change to any[] instead of string
    viewport: object; // Change to object instead of string
  }>,
) {
  const userId = await getUserId();

  const updateData: any = {
    updated_at: new Date(), // Use Date object
  };

  // Only include fields that are provided
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.nodes !== undefined) updateData.nodes = data.nodes; // Direct assignment
  if (data.edges !== undefined) updateData.edges = data.edges; // Direct assignment
  if (data.viewport !== undefined) updateData.viewport = data.viewport; // Direct assignment

  const [updatedDiagram] = await db
    .update(diagrams)
    .set(updateData)
    .where(
      and(
        eq(diagrams.id, id),
        eq(diagrams.user_id, userId), // Add user ownership check
      ),
    )
    .returning();

  if (!updatedDiagram) throw new Error("Diagram not found or unauthorized");
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
