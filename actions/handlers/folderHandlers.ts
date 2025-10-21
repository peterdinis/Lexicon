import { db } from "@/drizzle/db";
import { folders } from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { eq, asc } from "drizzle-orm";

export function generateId() {
  return crypto.randomUUID().replace(/-/g, "");
}

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
