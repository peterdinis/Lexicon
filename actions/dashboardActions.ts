"use server";

import { actionClient } from "@/lib/safe-action";
import { getSupabaseServerClient } from "@/supabase/server";
import { getErrorMessage } from "@/constants/applicationConstants";

// Action to fetch the current user and their pages
export const fetchDashboardDataAction = actionClient.action(async () => {
  try {
    const supabase = await getSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("Unauthorized");

    // Get pages for the user
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (pagesError) throw pagesError;

    return { user, pages: pages || [] };
  } catch (err) {
    throw new Error(getErrorMessage(err) || "Failed to fetch dashboard data");
  }
});

export const fetchUserAction = actionClient.action(async () => {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("Unauthorized");

    return user;
  } catch (err) {
    throw new Error(getErrorMessage(err) || "Failed to fetch user");
  }
});
