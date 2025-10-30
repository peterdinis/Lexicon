export interface CalendarEventUpdateData {
  title?: string;
  description?: string | null;
  start_time?: Date;
  end_time?: Date;
  color?: string | null;
  all_day?: boolean;
  updated_at: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color?: string | null;
  user_id?: string;
  in_trash?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CreateCalendarEventData {
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color?: string | null;
}

export interface ValidationErrors {
  title?: string;
  start_time?: string;
  end_time?: string;
}

export type OptimisticEvent = CalendarEvent & { pending?: boolean };

export interface CalendarViewProps {
  initialEvents: CalendarEvent[];
}

export interface CalendarActionResponse {
  data?: CalendarEvent[];
  success?: boolean;
  error?: string;
}

export interface UpdateEventData {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color?: string | null;
}

// Custom types for unknown event data
export interface UnknownEventData {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  start_time?: unknown;
  end_time?: unknown;
  all_day?: unknown;
  color?: unknown;
  user_id?: unknown;
  in_trash?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
}

export interface CalendarViewProps {
  initialEvents: CalendarEvent[];
}

// Type for optimistic update actions
export type OptimisticUpdateAction = 
  | { type: "add"; event: CreateCalendarEventData }
  | { type: "update"; event: CalendarEvent }
  | { type: "delete"; id: string };