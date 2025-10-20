import { getSupabaseServerClient } from "@/supabase/server";

export async function createFolderHandler(parentId?: string | null) {
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
      title: "New Folder",
      is_folder: true,
      parent_id: parentId || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to create folder");

  return data;
}