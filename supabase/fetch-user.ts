import { getSupabaseBrowserClient } from "./client";

export const supabase = getSupabaseBrowserClient();

export const fetchUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("No user");
  return data.user;
};