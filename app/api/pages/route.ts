import { getSupabaseServerClient } from "@/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: pages, error } = await supabase
      .from("pages")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(pages)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, parent_id, is_folder } = await request.json()

    const { data: page, error } = await supabase
      .from("pages")
      .insert({
        user_id: user.id,
        title: title || (is_folder ? "Untitled Folder" : "Untitled"),
        parent_id: parent_id || null,
        is_folder: is_folder || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(page)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}