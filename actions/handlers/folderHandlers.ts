import { db } from "@/drizzle/db";
import { folders, pages } from "@/drizzle/schema";
import { generateId } from "@/lib/generate-id";
import { eq, asc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createFolderInputSchema, folderIdSchema, UpdateFolderInput, updateFolderInputSchema } from "../schemas/folderSchemas";
import { validateUser } from "@/supabase/get-user-id";


export async function createFolderHandler(
  parentId: string | null,
  title: string,
) {
  // Validate input
  const validatedData = createFolderInputSchema.parse({ parentId, title });
  const userId = await validateUser();

  const newFolder = {
    id: generateId(),
    user_id: userId,
    title: validatedData.title,
    parent_id: validatedData.parentId,
    in_trash: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const [created] = await db.insert(folders).values(newFolder).returning();
  if (!created) throw new Error("Failed to create folder");

  revalidatePath("/folders");
  return created;
}

export async function getFoldersHandler() {
  const userId = await validateUser();

  const data = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.user_id, userId),
        eq(folders.in_trash, false),
      ),
    )
    .orderBy(asc(folders.created_at));

  return data;
}

export async function getFolderDetailHandler(folderId: string) {
  const { folderId: validatedId } = folderIdSchema.parse({ folderId });
  const userId = await validateUser();

  // Get folder details
  const [folder] = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.id, validatedId),
        eq(folders.user_id, userId),
        eq(folders.in_trash, false),
      ),
    );

  if (!folder) throw new Error("Folder not found");

  // Get pages in folder (excluding trashed pages)
  const pagesInFolder = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.parent_id, validatedId),
        eq(pages.user_id, userId),
        eq(pages.in_trash, false),
      ),
    )
    .orderBy(asc(pages.created_at));

  // Get subfolders (excluding trashed folders)
  const subfolders = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.user_id, userId),
        eq(folders.in_trash, false),
      ),
    )
    .orderBy(asc(folders.created_at));

  return {
    folder,
    pages: pagesInFolder,
    subfolders,
  };
}

export async function updateFolderHandler(
  folderId: string,
  data: UpdateFolderInput,
) {
  const { folderId: validatedId } = folderIdSchema.parse({ folderId });
  const validatedData = updateFolderInputSchema.parse(data);
  const userId = await validateUser();

  const updateData = {
    updated_at: new Date(),
    ...validatedData,
  };

  const [updatedFolder] = await db
    .update(folders)
    .set(updateData)
    .where(and(eq(folders.id, validatedId), eq(folders.user_id, userId)))
    .returning();

  if (!updatedFolder) throw new Error("Folder not found or update failed");

  revalidatePath("/folders");
  return updatedFolder;
}

export async function deleteFolderHandler(folderId: string) {
  const { folderId: validatedId } = folderIdSchema.parse({ folderId });
  const userId = await validateUser();

  const [deletedFolder] = await db
    .update(folders)
    .set({
      in_trash: true,
      updated_at: new Date(),
    })
    .where(and(eq(folders.id, validatedId), eq(folders.user_id, userId)))
    .returning();

  if (!deletedFolder) throw new Error("Folder not found");

  revalidatePath("/folders");
  return deletedFolder;
}

export async function hardDeleteFolderHandler(folderId: string) {
  const { folderId: validatedId } = folderIdSchema.parse({ folderId });
  const userId = await validateUser();

  const [deletedFolder] = await db
    .delete(folders)
    .where(and(eq(folders.id, validatedId), eq(folders.user_id, userId)))
    .returning();

  if (!deletedFolder) throw new Error("Folder not found");

  revalidatePath("/folders");
  return { success: true };
}

export async function restoreFolderHandler(folderId: string) {
  const { folderId: validatedId } = folderIdSchema.parse({ folderId });
  const userId = await validateUser();

  const [restoredFolder] = await db
    .update(folders)
    .set({
      in_trash: false,
      updated_at: new Date(),
    })
    .where(and(eq(folders.id, validatedId), eq(folders.user_id, userId)))
    .returning();

  if (!restoredFolder) throw new Error("Folder not found");

  revalidatePath("/folders");
  return restoredFolder;
}

export async function getTrashedFoldersHandler() {
  const userId = await validateUser();

  const data = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.user_id, userId),
        eq(folders.in_trash, true),
      ),
    )
    .orderBy(asc(folders.updated_at));

  return data;
}

export async function getAllFoldersHandler() {
  const userId = await validateUser();

  const data = await db
    .select()
    .from(folders)
    .where(eq(folders.user_id, userId))
    .orderBy(asc(folders.created_at));

  return data;
}