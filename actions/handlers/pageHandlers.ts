import { getSupabaseServerClient } from "@/supabase/server";

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

export async function updatePageHandler(id: string, content: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("pages")
    .update({ content })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to update page");

  return data;
}
