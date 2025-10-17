import { getErrorMessage } from "@/constants/applicationConstants";
import { getSupabaseServerClient } from "@/supabase/server";
import { NextResponse } from "next/server";

interface Page {
  id: string;
  user_id: string;
  title: string;
  parent_id: string | null;
  is_folder: boolean;
  deleted_at: string | null;
  updated_at: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pages, error } = await supabase
      .from("pages")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(pages);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      title?: string;
      parent_id?: string | null;
      is_folder?: boolean;
    };

    const { title, parent_id, is_folder } = body;

    const { data: page, error } = await supabase
      .from("pages")
      .insert({
        user_id: user.id,
        title: title || (is_folder ? "Untitled Folder" : "Untitled"),
        parent_id: parent_id ?? null,
        is_folder: is_folder ?? false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(page);
  } catch (error) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
