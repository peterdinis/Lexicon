import { redirect } from "next/navigation";
import { getAllPagesHandler } from "@/actions/handlers/pageHandlers";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { CalendarView } from "@/components/calendar/CalendarWrapper";

export default async function CalendarPage() {
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
          <div className="mx-auto max-w-6xl p-8">
            <h1 className="mb-8 text-4xl font-bold">Calendar</h1>
            <CalendarView initialEvents={[]} />
          </div>
        </main>
      </div>
    </div>
  );
}
