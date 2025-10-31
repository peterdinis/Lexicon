import { getSupabaseServerClient } from "./server";

export async function getUserId() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function validateUser() {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unauthorized");

  return user;
}

