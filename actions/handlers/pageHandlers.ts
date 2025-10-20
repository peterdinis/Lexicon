import { db } from "@/drizzle/db";
import { pages } from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { eq } from "drizzle-orm";

export async function getPageHandler(id: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  if (!page) throw new Error("Page not found");

  return page;
}

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

  const { data, error } = await supabase
    .from("pages")
    .insert({
      user_id: user.id,
      title,
      description,
    })
    .select("*")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to create page");

  return data;
}

export async function updatePageHandler(
  id: string,
  data: { title?: string; description?: string },
) {
  const updateData: Partial<typeof pages.$inferInsert> = {
    ...(data.title ? { title: data.title } : {}),
    ...(data.description ? { description: data.description } : {}),
    updated_at: new Date(),
  };

  const [updatedPage] = await db
    .update(pages)
    .set(updateData)
    .where(eq(pages.id, id))
    .returning();

  return updatedPage;
}

export async function getAllPagesHandler() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const { data: pages, error } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return pages || [];
}

export async function deletePageHandler(pageId: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("pages").delete().eq("id", pageId);
  if (error) throw error;
  return { success: true };
}

export async function movePageHandler(pageId: string, parentId: string | null) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("pages")
    .update({ parent_id: parentId })
    .eq("id", pageId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to move page");
  return data;
}
