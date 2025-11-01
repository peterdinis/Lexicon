import { db } from "@/drizzle/db";
import { pages } from "@/drizzle/schema";
import { getAuthenticatedUser } from "@/supabase/get-user-id";
import { randomUUID } from "crypto";
import { eq, asc, and } from "drizzle-orm";

export async function getPageHandler(id: string) {
  const { user } = await getAuthenticatedUser();

  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.id, id),
        eq(pages.user_id, user.id),
        eq(pages.in_trash, false),
      ),
    );

  if (!page) throw new Error("Page not found");
  return page;
}

export async function createPageHandler(
  title: string = "Untitled",
  description: string = "",
  parent_id: string | null = null,
  is_folder: boolean = false,
) {
  const { user } = await getAuthenticatedUser();

  const [newPage] = await db
    .insert(pages)
    .values({
      id: randomUUID(),
      user_id: user.id,
      title,
      description,
      parent_id,
      is_folder,
      in_trash: false,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  if (!newPage) throw new Error("Failed to create page");
  return newPage;
}

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
  const { user } = await getAuthenticatedUser();

  const updateData: {
    updated_at: Date;
    title?: string;
    description?: string;
    icon?: string;
    coverImage?: string | null;
    parent_id?: string | null;
  } = {
    updated_at: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
  if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;

  const fieldsToUpdate = Object.keys(updateData).filter(
    (key) => key !== "updated_at",
  );
  if (fieldsToUpdate.length === 0) {
    throw new Error("No valid fields to update");
  }

  const [updatedPage] = await db
    .update(pages)
    .set(updateData)
    .where(and(eq(pages.id, id), eq(pages.user_id, user.id)))
    .returning();

  if (!updatedPage) throw new Error("Page not found or unauthorized");
  return updatedPage;
}

export async function getAllPagesHandler() {
  const { user } = await getAuthenticatedUser();

  const allPages = await db
    .select()
    .from(pages)
    .where(and(eq(pages.user_id, user.id), eq(pages.in_trash, false)))
    .orderBy(asc(pages.created_at));

  return allPages || [];
}

export async function getPagesByParentHandler(parent_id: string | null = null) {
  const { user } = await getAuthenticatedUser();

  const pagesList = await db
    .select()
    .from(pages)
    .where(and(eq(pages.user_id, user.id), eq(pages.in_trash, false)))
    .orderBy(asc(pages.created_at));

  return pagesList || [];
}

export async function deletePageHandler(pageId: string) {
  const { user } = await getAuthenticatedUser();

  const [deletedPage] = await db
    .update(pages)
    .set({
      in_trash: true,
      updated_at: new Date(),
    })
    .where(and(eq(pages.id, pageId), eq(pages.user_id, user.id)))
    .returning();

  if (!deletedPage) throw new Error("Page not found or unauthorized");

  return { success: true, page: deletedPage };
}

export async function hardDeletePageHandler(pageId: string) {
  const { user } = await getAuthenticatedUser();

  const [deletedPage] = await db
    .delete(pages)
    .where(and(eq(pages.id, pageId), eq(pages.user_id, user.id)))
    .returning();

  if (!deletedPage) throw new Error("Page not found or unauthorized");

  return { success: true };
}

export async function restorePageHandler(pageId: string) {
  const { user } = await getAuthenticatedUser();

  const [restoredPage] = await db
    .update(pages)
    .set({
      in_trash: false,
      updated_at: new Date(),
    })
    .where(and(eq(pages.id, pageId), eq(pages.user_id, user.id)))
    .returning();

  if (!restoredPage) throw new Error("Page not found or unauthorized");

  return { success: true, page: restoredPage };
}

export async function movePageHandler(
  id: string,
  parent_id: string | null = null,
) {
  const { user } = await getAuthenticatedUser();

  const [updatedPage] = await db
    .update(pages)
    .set({
      parent_id: parent_id,
      updated_at: new Date(),
    })
    .where(and(eq(pages.id, id), eq(pages.user_id, user.id)))
    .returning();

  if (!updatedPage) throw new Error("Failed to move page or unauthorized");
  return updatedPage;
}

export async function getTrashedPagesHandler() {
  const { user } = await getAuthenticatedUser();

  const trashedPages = await db
    .select()
    .from(pages)
    .where(and(eq(pages.user_id, user.id), eq(pages.in_trash, true)))
    .orderBy(asc(pages.updated_at));

  return trashedPages || [];
}

export async function searchPagesHandler(query: string) {
  const { user } = await getAuthenticatedUser();

  const searchResults = await db
    .select()
    .from(pages)
    .where(and(eq(pages.user_id, user.id), eq(pages.in_trash, false)))
    .orderBy(asc(pages.created_at));

  const filteredResults = searchResults.filter(
    (page) =>
      page.title.toLowerCase().includes(query.toLowerCase()) ||
      page.description.toLowerCase().includes(query.toLowerCase()),
  );

  return filteredResults;
}
