"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { actionClient } from "@/lib/safe-action";
import { getErrorMessage } from "@/constants/applicationConstants";
import { getSupabaseServerClient } from "@/supabase/server";
import { checkEmailSchema } from "./schemas/authSchemas";

export const fetchUser = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(async ({ name, value, options }) =>
            (await cookieStore).set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || "No user found");
  if (!data.user) throw new Error("No user found");

  return data.user;
};

export const checkEmailAction = actionClient
  .inputSchema(checkEmailSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      const supabase = await getSupabaseServerClient();

      // Check if a user with this email exists
      const { data: user, error } = await supabase
        .from("users") // or "auth.users" if using Supabase auth table
        .select("id")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found

      return {
        exists: Boolean(user),
      };
    } catch (err) {
      throw new Error(getErrorMessage(err) || "Failed to check email");
    }
  });