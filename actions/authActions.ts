"use server";

import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { actionClient } from "@/lib/safe-action";

const exchangeCodeSchema = z.object({
  code: z.string().min(1),
  next: z.string().optional(),
  type: z.enum(["recovery", "login"]).optional(),
});

export const exchangeCodeAction = actionClient
  .inputSchema(exchangeCodeSchema)
  .action(async ({ parsedInput: { code, next = "/dashboard", type } }) => {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options),
                );
              } catch {
                // no-op if setAll fails in Server Component
              }
            },
          },
        },
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw new Error(error.message);

      if (type === "recovery") {
        return { redirect: "/auth/reset-password" };
      }

      return { redirect: next };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to exchange code");
    }
  });
