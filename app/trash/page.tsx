import { getAllPagesHandler } from "@/actions/pagesActions";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { TrashWrapper } from "@/components/trash/TrashWrapper";
import { getSupabaseServerClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function TrashPage() {
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
      <DashboardSidebar initialPages={pages || []} />
      <div className="flex flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-8">
            <TrashWrapper />
          </div>
        </main>
      </div>
    </div>
  );
}
