"use server";

import { z } from "zod";
import { getSupabaseServerClient } from "@/supabase/server";
import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";

const pageIdSchema = z.object({
  id: z.string().min(1),
});

const updatePageSchema = pageIdSchema.extend({
  title: z.string().optional(),
  content: z.string().optional(),
  icon: z.string().optional(),
  cover_image: z.string().nullable().optional(),
});

export const getPageAction = actionClient
  .inputSchema(pageIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
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
      return page;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

export const updatePageAction = actionClient
  .inputSchema(updatePageSchema)
  .action(
    async ({ parsedInput: { id, title, content, icon, cover_image } }) => {
      try {
        const supabase = await getSupabaseServerClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw new Error(userError.message);
        if (!user) throw new Error("Unauthorized");

        const updateData: any = {
          updated_at: new Date().toISOString(),
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(icon !== undefined && { icon }),
          ...(cover_image !== undefined && { cover_image }),
        };

        const { data: page, error } = await supabase
          .from("pages")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return page;
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
  );

export const deletePageAction = actionClient
  .inputSchema(pageIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const supabase = await getSupabaseServerClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw new Error(userError.message);
      if (!user) throw new Error("Unauthorized");

      const { error } = await supabase
        .from("pages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });
