import { redirect } from "next/navigation";
import { getAllPagesHandler } from "@/actions/handlers/pageHandlers";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { CalendarView } from "@/components/calendar/CalendarWrapper";
import { CalendarEvent } from "@/types/applicationTypes";

export default async function CalendarPage() {
  let pages = [];
  let events:
    | {
        all_day: boolean;
        id: string;
        user_id: string;
        title: string;
        description: string | null;
        start_time: string;
        end_time: string;
        color: string | null;
        created_at: string | null;
        updated_at: string | null;
      }[]
    | CalendarEvent[] = [];

  try {
    // Načtení pages pro sidebar
    pages = await getAllPagesHandler();

    // Načtení calendar events
    const eventsResult = await getCalendarEventsAction();
    if (eventsResult.success && eventsResult.data) {
      events = eventsResult.data;
    }
  } catch (err) {
    console.error("Calendar page fetch error:", err);
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar initialPages={pages || []} />
      <div className="flex flex-1 flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
              <p className="text-muted-foreground mt-2">
                Manage your events and schedule
              </p>
            </div>
            <CalendarView initialEvents={events} />
          </div>
        </main>
      </div>
    </div>
  );
}
