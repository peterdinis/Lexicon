import { db } from "@/drizzle/db";
import { pages } from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { randomUUID } from "crypto";
import { eq, asc, and } from "drizzle-orm";

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
    .where(
      and(
        eq(pages.id, id),
        eq(pages.user_id, user.id),
        eq(pages.in_trash, false) // Exclude trashed pages
      )
    );

  if (!page) throw new Error("Page not found");
  return page;
}

// ----------------------
// Create Page
// ----------------------
export async function createPageHandler(
  title: string = "Untitled",
  description: string = "",
  parent_id: string | null = null,
  is_folder: boolean = false
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
      parent_id,
      is_folder,
      in_trash: false, // Add missing required field
      created_at: new Date(), // Use Date object
      updated_at: new Date(), // Use Date object
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
    parent_id?: string | null;
  },
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const updateData: any = {
    updated_at: new Date(), // Use Date object
  };

  // Only include fields that are provided
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.coverImage !== undefined) updateData.cover_image = data.coverImage;
  if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;

  // Check if there's anything to update (besides updated_at)
  if (Object.keys(updateData).length <= 1) {
    throw new Error("No valid fields to update");
  }

  const [updatedPage] = await db
    .update(pages)
    .set(updateData)
    .where(
      and(
        eq(pages.id, id),
        eq(pages.user_id, user.id)
      )
    )
    .returning();

  if (!updatedPage) throw new Error("Page not found or unauthorized");
  return updatedPage;
}

// ----------------------
// Get All Pages (Exclude trashed)
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
    .where(
      and(
        eq(pages.user_id, user.id),
        eq(pages.in_trash, false) // Exclude trashed pages
      )
    )
    .orderBy(asc(pages.created_at));

  return allPages || [];
}

// ----------------------
// Get Pages by Parent (for folder contents)
// ----------------------
export async function getPagesByParentHandler(parent_id: string | null = null) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const pagesList = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.user_id, user.id),
        eq(pages.in_trash, false)
      )
    )
    .orderBy(asc(pages.created_at));

  return pagesList || [];
}

// ----------------------
// Soft Delete Page (Move to trash)
// ----------------------
export async function deletePageHandler(pageId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [deletedPage] = await db
    .update(pages)
    .set({ 
      in_trash: true,
      updated_at: new Date()
    })
    .where(
      and(
        eq(pages.id, pageId),
        eq(pages.user_id, user.id)
      )
    )
    .returning();

  if (!deletedPage) throw new Error("Page not found or unauthorized");

  return { success: true, page: deletedPage };
}

// ----------------------
// Hard Delete Page (Permanent removal)
// ----------------------
export async function hardDeletePageHandler(pageId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [deletedPage] = await db
    .delete(pages)
    .where(
      and(
        eq(pages.id, pageId),
        eq(pages.user_id, user.id)
      )
    )
    .returning();

  if (!deletedPage) throw new Error("Page not found or unauthorized");

  return { success: true };
}

// ----------------------
// Restore Page from Trash
// ----------------------
export async function restorePageHandler(pageId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [restoredPage] = await db
    .update(pages)
    .set({ 
      in_trash: false,
      updated_at: new Date()
    })
    .where(
      and(
        eq(pages.id, pageId),
        eq(pages.user_id, user.id)
      )
    )
    .returning();

  if (!restoredPage) throw new Error("Page not found or unauthorized");

  return { success: true, page: restoredPage };
}

// ----------------------
// Move Page
// ----------------------
export async function movePageHandler(
  id: string,
  parent_id: string | null = null,
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [updatedPage] = await db
    .update(pages)
    .set({
      parent_id: parent_id,
      updated_at: new Date(), // Use Date object
    })
    .where(
      and(
        eq(pages.id, id),
        eq(pages.user_id, user.id)
      )
    )
    .returning();

  if (!updatedPage) throw new Error("Failed to move page or unauthorized");
  return updatedPage;
}

// ----------------------
// Get Trashed Pages
// ----------------------
export async function getTrashedPagesHandler() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const trashedPages = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.user_id, user.id),
        eq(pages.in_trash, true)
      )
    )
    .orderBy(asc(pages.updated_at));

  return trashedPages || [];
}

// ----------------------
// Search Pages
// ----------------------
export async function searchPagesHandler(query: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  // Simple search using ILIKE for case-insensitive matching
  const searchResults = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.user_id, user.id),
        eq(pages.in_trash, false)
      )
    )
    .orderBy(asc(pages.created_at));

  // Filter in JavaScript for simple search (for more complex search, use PostgreSQL full-text search)
  const filteredResults = searchResults.filter(page => 
    page.title.toLowerCase().includes(query.toLowerCase()) ||
    page.description.toLowerCase().includes(query.toLowerCase())
  );

  return filteredResults;
}