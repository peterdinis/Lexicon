import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import DashboardTopBar from "@/components/dashboard/DashboardTopBar"
import { TodoWrapper } from "@/components/todos/TodosWrapper"
import { getSupabaseServerClient } from "@/supabase/server"
import { redirect } from "next/navigation"

export default async function TodosPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })

  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex h-screen">
      <DashboardSidebar initialPages={pages || []} />
      <div className="flex flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-8">
            <h1 className="mb-8 text-4xl font-bold">Todos</h1>
            <TodoWrapper initialTodos={todos || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
