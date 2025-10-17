import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import DashboardTopBar from "@/components/dashboard/DashboardTopBar"
import { getSupabaseServerClient } from "@/supabase/server"
import { PageHeader } from "@/components/pages/PageHeader"
import { TiptapEditor } from "@/components/editor/TipTapEditor"

export default async function PageView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: page } = await supabase.from("pages").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!page) {
    redirect("/")
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })

  return (
    <div className="flex h-screen flex-col">
      <DashboardTopBar  userEmail={user.email || ""} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar initialPages={pages || []} currentPageId={id} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <PageHeader pageId={id} title={page.title} icon={page.icon} coverImage={page.cover_image} />
          <main className="flex-1 overflow-y-auto">
            <TiptapEditor pageId={id} initialContent={page.content || ""} />
          </main>
        </div>
      </div>
    </div>
  )
}