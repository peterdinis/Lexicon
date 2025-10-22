import { getAllPagesHandler } from "@/actions/handlers/pageHandlers";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { TodoWrapper } from "@/components/todos/TodosWrapper";
import { getSupabaseServerClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function TodosPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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
      <DashboardSidebar initialPages={pages ?? []} />
      <div className="flex flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-8">
            <h1 className="mb-8 text-4xl font-bold">Todos</h1>
            <TodoWrapper initialTodos={[]} />
          </div>
        </main>
      </div>
    </div>
  );
}
