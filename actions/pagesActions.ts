"use server";

import { z } from "zod";
import { getSupabaseServerClient } from "@/supabase/server";
import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";

const pageIdSchema = z.object({
  id: z.string().min(1),
});

const createPageSchema = z.object({
  title: z.string().optional().default("Untitled"),
  description: z.string().optional().default(""),
});

async function createPageHandler(title: string = "Untitled", description: string = "") {
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

// Action používajúca pomocnú funkciu
export const createPageAction = actionClient
  .inputSchema(createPageSchema)
  .action(async ({ parsedInput: { title = "Untitled", description = "" } }) => {
    try {
      return await createPageHandler(title, description);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });
