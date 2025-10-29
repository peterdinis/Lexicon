import { db } from "@/drizzle/db";
import { folders, pages } from "@/drizzle/schema";
import { generateId } from "@/lib/generate-id";
import { getSupabaseServerClient } from "@/supabase/server";
import { eq, asc, and } from "drizzle-orm";

export async function createFolderHandler(
  parentId: string | null,
  title: string,
) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const newFolder = {
    id: generateId(),
    user_id: user.id,
    title,
    parent_id: parentId,
    in_trash: false, // Add missing required field
    created_at: new Date(), // Use Date object
    updated_at: new Date(), // Use Date object
  };

  const [created] = await db.insert(folders).values(newFolder).returning();

  if (!created) throw new Error("Failed to create folder");

  return created;
}

export async function getFoldersHandler() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const data = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.user_id, user.id),
        eq(folders.in_trash, false), // Exclude trashed folders
      ),
    )
    .orderBy(asc(folders.created_at));

  return data;
}

export async function getFolderDetailHandler(folderId: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  // Get folder details
  const [folder] = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.id, folderId),
        eq(folders.user_id, user.id),
        eq(folders.in_trash, false), // Exclude trashed folders
      ),
    );

  if (!folder) throw new Error("Folder not found");

  // Get pages in folder (excluding trashed pages)
  const pagesInFolder = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.parent_id, folderId),
        eq(pages.user_id, user.id),
        eq(pages.in_trash, false), // Exclude trashed pages
      ),
    )
    .orderBy(asc(pages.created_at));

  // Get subfolders (excluding trashed folders)
  const subfolders = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.user_id, user.id),
        eq(folders.in_trash, false), // Exclude trashed folders
      ),
    )
    .orderBy(asc(folders.created_at));

  return {
    folder,
    pages: pagesInFolder,
    subfolders,
  };
}

// UPDATE FOLDER
export async function updateFolderHandler(
  folderId: string,
  data: {
    title?: string;
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

  if (data.title !== undefined) updateData.title = data.title;
  if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;

  const [updatedFolder] = await db
    .update(folders)
    .set(updateData)
    .where(and(eq(folders.id, folderId), eq(folders.user_id, user.id)))
    .returning();

  if (!updatedFolder) throw new Error("Folder not found or update failed");

  return updatedFolder;
}

// SOFT DELETE FOLDER (Move to trash)
export async function deleteFolderHandler(folderId: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [deletedFolder] = await db
    .update(folders)
    .set({
      in_trash: true,
      updated_at: new Date(),
    })
    .where(and(eq(folders.id, folderId), eq(folders.user_id, user.id)))
    .returning();

  if (!deletedFolder) throw new Error("Folder not found");

  return deletedFolder;
}

// HARD DELETE FOLDER (Permanent removal)
export async function hardDeleteFolderHandler(folderId: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [deletedFolder] = await db
    .delete(folders)
    .where(and(eq(folders.id, folderId), eq(folders.user_id, user.id)))
    .returning();

  if (!deletedFolder) throw new Error("Folder not found");

  return { success: true };
}

// RESTORE FOLDER FROM TRASH
export async function restoreFolderHandler(folderId: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const [restoredFolder] = await db
    .update(folders)
    .set({
      in_trash: false,
      updated_at: new Date(),
    })
    .where(and(eq(folders.id, folderId), eq(folders.user_id, user.id)))
    .returning();

  if (!restoredFolder) throw new Error("Folder not found");

  return restoredFolder;
}

// GET TRASHED FOLDERS
export async function getTrashedFoldersHandler() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const data = await db
    .select()
    .from(folders)
    .where(
      and(
        eq(folders.user_id, user.id),
        eq(folders.in_trash, true), // Only trashed folders
      ),
    )
    .orderBy(asc(folders.updated_at));

  return data;
}

// GET ALL FOLDERS (including trashed - for admin purposes)
export async function getAllFoldersHandler() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const data = await db
    .select()
    .from(folders)
    .where(eq(folders.user_id, user.id))
    .orderBy(asc(folders.created_at));

  return data;
}
