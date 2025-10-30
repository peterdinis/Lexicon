"use server";

import { db } from "@/drizzle/db";
import { pages } from "@/drizzle/schema";
import { validateUser } from "@/supabase/get-user-id";
import { randomUUID } from "crypto";
import { eq, asc, and, like, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  pageIdSchema,
  createPageInputSchema,
  type UpdatePageInput,
  updatePageInputSchema,
  movePageInputSchema,
  searchPagesInputSchema,
} from "./schemas/pagesSchemas";

export async function getPageHandler(id: string) {
  const { id: validatedId } = pageIdSchema.parse({ id });
  const userId = await validateUser();

  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.id, validatedId),
        eq(pages.user_id, userId),
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
  const validatedData = createPageInputSchema.parse({
    title,
    description,
    parent_id,
    is_folder,
  });

  const userId = await validateUser();

  const [newPage] = await db
    .insert(pages)
    .values({
      id: randomUUID(),
      user_id: userId,
      title: validatedData.title,
      description: validatedData.description,
      parent_id: validatedData.parent_id,
      is_folder: validatedData.is_folder,
      in_trash: false,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  if (!newPage) throw new Error("Failed to create page");

  revalidatePath("/pages");
  return newPage;
}

export async function updatePageHandler(id: string, data: UpdatePageInput) {
  const { id: validatedId } = pageIdSchema.parse({ id });
  const validatedData = updatePageInputSchema.parse(data);
  const userId = await validateUser();

  const updateData: {
    updated_at: Date;
    title?: string;
    description?: string;
    icon?: string;
    cover_image?: string | null;
    parent_id?: string | null;
  } = {
    updated_at: new Date(),
  };

  if (validatedData.title !== undefined) updateData.title = validatedData.title;
  if (validatedData.description !== undefined)
    updateData.description = validatedData.description;
  if (validatedData.icon !== undefined) updateData.icon = validatedData.icon;
  if (validatedData.coverImage !== undefined)
    updateData.cover_image = validatedData.coverImage;
  if (validatedData.parent_id !== undefined)
    updateData.parent_id = validatedData.parent_id;

  const updateFields = Object.keys(updateData).filter(
    (key) => key !== "updated_at",
  );
  if (updateFields.length === 0) {
    throw new Error("No valid fields to update");
  }

  const [updatedPage] = await db
    .update(pages)
    .set(updateData)
    .where(and(eq(pages.id, validatedId), eq(pages.user_id, userId)))
    .returning();

  if (!updatedPage) throw new Error("Page not found or unauthorized");

  revalidatePath("/pages");
  return updatedPage;
}

export async function getAllPagesHandler() {
  const userId = await validateUser();

  const allPages = await db
    .select()
    .from(pages)
    .where(and(eq(pages.user_id, userId), eq(pages.in_trash, false)))
    .orderBy(asc(pages.created_at));

  return allPages;
}

export async function getPagesByParentHandler(parent_id: string | null = null) {
  const userId = await validateUser();

  const whereConditions = [
    eq(pages.user_id, userId),
    eq(pages.in_trash, false),
  ];

  const pagesList = await db
    .select()
    .from(pages)
    .where(and(...whereConditions))
    .orderBy(asc(pages.created_at));

  return pagesList;
}

export async function deletePageHandler(pageId: string) {
  const { id: validatedId } = pageIdSchema.parse({ id: pageId });
  const userId = await validateUser();

  const [deletedPage] = await db
    .update(pages)
    .set({
      in_trash: true,
      updated_at: new Date(),
    })
    .where(and(eq(pages.id, validatedId), eq(pages.user_id, userId)))
    .returning();

  if (!deletedPage) throw new Error("Page not found or unauthorized");

  revalidatePath("/pages");
  return { success: true, page: deletedPage };
}

export async function hardDeletePageHandler(pageId: string) {
  const { id: validatedId } = pageIdSchema.parse({ id: pageId });
  const userId = await validateUser();

  const [deletedPage] = await db
    .delete(pages)
    .where(and(eq(pages.id, validatedId), eq(pages.user_id, userId)))
    .returning();

  if (!deletedPage) throw new Error("Page not found or unauthorized");

  revalidatePath("/pages");
  return { success: true };
}

export async function restorePageHandler(pageId: string) {
  const { id: validatedId } = pageIdSchema.parse({ id: pageId });
  const userId = await validateUser();

  const [restoredPage] = await db
    .update(pages)
    .set({
      in_trash: false,
      updated_at: new Date(),
    })
    .where(and(eq(pages.id, validatedId), eq(pages.user_id, userId)))
    .returning();

  if (!restoredPage) throw new Error("Page not found or unauthorized");

  revalidatePath("/pages");
  return { success: true, page: restoredPage };
}

export async function movePageHandler(
  id: string,
  parent_id: string | null = null,
) {
  const { id: validatedId } = pageIdSchema.parse({ id });
  const validatedData = movePageInputSchema.parse({ parent_id });
  const userId = await validateUser();

  const [updatedPage] = await db
    .update(pages)
    .set({
      parent_id: validatedData.parent_id,
      updated_at: new Date(),
    })
    .where(and(eq(pages.id, validatedId), eq(pages.user_id, userId)))
    .returning();

  if (!updatedPage) throw new Error("Failed to move page or unauthorized");

  revalidatePath("/pages");
  return updatedPage;
}

export async function getTrashedPagesHandler() {
  const userId = await validateUser();

  const trashedPages = await db
    .select()
    .from(pages)
    .where(and(eq(pages.user_id, userId), eq(pages.in_trash, true)))
    .orderBy(asc(pages.updated_at));

  return trashedPages;
}

export async function searchPagesHandler(query: string) {
  const validatedData = searchPagesInputSchema.parse({ query });
  const userId = await validateUser();

  const searchResults = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.user_id, userId),
        eq(pages.in_trash, false),
        or(
          like(pages.title, `%${validatedData.query}%`),
          like(pages.description, `%${validatedData.query}%`),
        ),
      ),
    )
    .orderBy(asc(pages.created_at));

  return searchResults;
}
