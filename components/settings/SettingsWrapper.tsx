import { redirect } from "next/navigation"
import { getAllPagesHandler } from "@/actions/handlers/pageHandlers"
import { getSupabaseServerClient } from "@/supabase/server"
import DashboardTopBar from "../dashboard/DashboardTopBar"
import { DashboardSidebar } from "../dashboard/DashboardSidebar"

export default async function SettingsWrapper() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let pages = [];
  
    try {
      pages = await getAllPagesHandler();
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      redirect("/auth/login");
    }

  return (
    <div className="flex h-screen">
      <DashboardSidebar initialPages={pages || []} />
      <div className="flex flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-8">
            <h1 className="mb-8 text-4xl font-bold">Settings</h1>
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h2 className="mb-2 text-xl font-semibold">Account</h2>
                <p className="text-sm text-muted-foreground">Email: {user.email}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}