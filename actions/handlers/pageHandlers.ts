import { db } from "@/drizzle/db";
import { pages } from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { randomUUID } from "crypto";
import { eq, asc } from "drizzle-orm";

// ----------------------
// Get Single Page
// ----------------------
export async function getPageHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.user_id, user.id));

  if (!page) throw new Error("Page not found");
  return page;
}

// ----------------------
// Create Page
// ----------------------
export async function createPageHandler(
  title: string = "Untitled",
  description: string = "",
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [newPage] = await db
    .insert(pages)
    .values({
      id: randomUUID(),
      user_id: user.id,
      title,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returning();

  if (!newPage) throw new Error("Failed to create page");
  return newPage;
}

// ----------------------
// Update Page
// ----------------------
export async function updatePageHandler(
  id: string,
  data: {
    title?: string;
    description?: string;
    icon?: string;
    coverImage?: string | null;
  },
) {
  const updateData: Partial<typeof pages.$inferInsert> = {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.description !== undefined
      ? { description: data.description }
      : {}),
    ...(data.icon !== undefined ? { icon: data.icon } : {}),
    ...(data.coverImage !== undefined ? { cover_image: data.coverImage } : {}),
    updated_at: new Date().toISOString(),
  };

  // Check if there's anything to update
  if (Object.keys(updateData).length <= 1) {
    // only updated_at
    throw new Error("No valid fields to update");
  }

  const [updatedPage] = await db
    .update(pages)
    .set(updateData)
    .where(eq(pages.id, id))
    .returning();

  if (!updatedPage) throw new Error("Page not found");
  return updatedPage;
}

// ----------------------
// Get All Pages
// ----------------------
export async function getAllPagesHandler() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const allPages = await db
    .select()
    .from(pages)
    .where(eq(pages.user_id, user.id))
    .orderBy(asc(pages.created_at));

  return allPages || [];
}

// ----------------------
// Delete Page
// ----------------------
export async function deletePageHandler(pageId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const deleted = await db.delete(pages).where(eq(pages.id, pageId));
  if (!deleted) throw new Error("Failed to delete page");

  return { success: true };
}

// ----------------------
// Move Page
// ----------------------
export async function movePageHandler(pageId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [updatedPage] = await db
    .update(pages)
    .set({ updated_at: new Date().toISOString() }) // len aktualizujeme timestamp
    .where(eq(pages.id, pageId))
    .returning();

  if (!updatedPage) throw new Error("Failed to update page");
  return updatedPage;
}
