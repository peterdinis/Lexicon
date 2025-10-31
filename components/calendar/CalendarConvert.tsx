import { UnknownEventData, CalendarEvent } from "@/types/calendarTypes";

export function convertToCalendarEvent(event: UnknownEventData): CalendarEvent {
  const convertToDateOrString = (dateValue: unknown): string => {
    if (!dateValue) return new Date().toISOString();

    if (typeof dateValue === "string") {
      return dateValue;
    }

    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }

    if (typeof dateValue === "object" && dateValue !== null) {
      try {
        const dateStr = String(dateValue);
        return dateStr;
      } catch {
        return new Date().toISOString();
      }
    }

    return new Date().toISOString();
  };

  return {
    id: String(event.id || ""),
    title: String(event.title || ""),
    description: event.description ? String(event.description) : null,
    start_time: convertToDateOrString(event.start_time),
    end_time: convertToDateOrString(event.end_time),
    all_day: Boolean(event.all_day),
    color: event.color ? String(event.color) : null,
    user_id: event.user_id ? String(event.user_id) : undefined,
    in_trash: Boolean(event.in_trash),
    created_at: convertToDateOrString(event.created_at),
    updated_at: convertToDateOrString(event.updated_at),
  };
}
