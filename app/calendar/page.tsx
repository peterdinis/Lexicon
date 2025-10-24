import { redirect } from "next/navigation";
import { getAllPagesHandler } from "@/actions/handlers/pageHandlers";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { CalendarView } from "@/components/calendar/CalendarWrapper";
import { CalendarEvent, Page } from "@/types/applicationTypes";
import { getAllCalendarEventsAction } from "@/actions/calendarActions";

export default async function CalendarPage() {
  let pages:
    | {
        id: string;
        user_id: string;
        title: string;
        description: string;
        parent_id: string | null;
        is_folder: number;
        created_at: string;
        updated_at: string;
      }[]
    | Page[] = [];
  let events: CalendarEvent[] = [];

  try {
    pages = await getAllPagesHandler();

    const eventsResult = await getAllCalendarEventsAction();
    events = Array.isArray(eventsResult) ? eventsResult : [];
  } catch (err) {
    pages = [];
    events = [];
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar initialPages={Array.isArray(pages) ? pages : []} />
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
