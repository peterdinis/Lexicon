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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.insert(folders).values(newFolder);

  const [created] = await db
    .select()
    .from(folders)
    .where(eq(folders.id, newFolder.id));

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
    .where(eq(folders.user_id, user.id))
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

  // Získanie detailu priečinka
  const [folder] = await db
    .select()
    .from(folders)
    .where(and(eq(folders.id, folderId), eq(folders.user_id, user.id)));

  if (!folder) throw new Error("Folder not found");

  // Získanie stránok v priečinku
  const pagesInFolder = await db
    .select()
    .from(pages)
    .where(and(eq(pages.parent_id, folderId), eq(pages.user_id, user.id)))
    .orderBy(asc(pages.created_at));

  // Získanie podpriečinkov
  const subfolders = await db
    .select()
    .from(folders)
    .where(and(eq(folders.user_id, user.id)))
    .orderBy(asc(folders.created_at));

  return {
    folder,
    pages: pagesInFolder,
    subfolders,
  };
}
