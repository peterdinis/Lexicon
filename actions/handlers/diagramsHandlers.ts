import { db } from "@/drizzle/db";
import { diagrams } from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { randomUUID } from "crypto";
import { eq, asc } from "drizzle-orm";

// ----------------------
// Get Single Diagram
// ----------------------
export async function getDiagramHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [diagram] = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.id, id))

  if (!diagram) throw new Error("Diagram not found");
  return diagram;
}

// ----------------------
// Create Diagram
// ----------------------
export async function createDiagramHandler(
  title: string = "Untitled Diagram",
  description: string = "",
  nodes: string = "[]",
  edges: string = "[]",
  viewport: string = '{"x":0,"y":0,"zoom":1}',
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [newDiagram] = await db
    .insert(diagrams)
    .values({
      id: randomUUID(),
      user_id: user.id,
      title,
      description,
      nodes,
      edges,
      viewport,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
    nodes: string;
    edges: string;
    viewport: string;
  }>,
) {
  const updateData: Partial<typeof diagrams.$inferInsert> = {
    ...(data.title ? { title: data.title } : {}),
    ...(data.description ? { description: data.description } : {}),
    ...(data.nodes ? { nodes: data.nodes } : {}),
    ...(data.edges ? { edges: data.edges } : {}),
    ...(data.viewport ? { viewport: data.viewport } : {}),
    updated_at: new Date().toISOString(),
  };

  const [updatedDiagram] = await db
    .update(diagrams)
    .set(updateData)
    .where(eq(diagrams.id, id))
    .returning();

  if (!updatedDiagram) throw new Error("Diagram not found");
  return updatedDiagram;
}

// ----------------------
// Get All Diagrams
// ----------------------
export async function getAllDiagramsHandler() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const allDiagrams = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.user_id, user.id))
    .orderBy(asc(diagrams.created_at));

  return allDiagrams || [];
}

// ----------------------
// Delete Diagram
// ----------------------
export async function deleteDiagramHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const deleted = await db.delete(diagrams).where(eq(diagrams.id, id));
  if (!deleted) throw new Error("Failed to delete diagram");

  return { success: true };
}
