import { ReactNode } from "react";
import {
  pages,
  todos,
  calendarEvents,
  diagrams,
  folders,
} from "@/drizzle/schema";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ResponseData<T> =
  | T
  | ApiResponse<T>
  | PaginatedResponse<T>
  | { data: T };

export interface BaseResponse<T> {
  data?: T;
}

interface SuccessResponse<T> extends BaseResponse<T> {
  success: boolean;
}

interface DataResponse<T> extends BaseResponse<T> {
  data: T;
}

export type ExtractableResponse<T> = T | BaseResponse<T> | SuccessResponse<T> | DataResponse<T> | T[];


export interface Page {
  children?(children: ReactNode, arg1: number): unknown;
  id: string;
  user_id: string;
  title: string;
  content?: string;
  description?: string;
  icon?: any;
  cover_image?: string;
  parent_id?: string | null;
  is_folder?: boolean;
  deleted_at?: string | null;
  created_at: any;
  updated_at: any;
  in_trash?: boolean;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  priority?: "low" | "medium" | "high";
  status?: "not_started" | "in_progress" | "done";
  due_date?: string;
  position: number;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  created_at: string;
  updated_at: string;
};

export interface Folder {
  id: string;
  user_id: string;
  title: string;
  in_trash?: number;
  created_at: string;
  updated_at: string;
}

export type SearchResult = {
  id: string;
  type: "page" | "todo" | "event" | "diagram" | "folder";
  title: string;
  description?: string;
  content?: string;
  icon?: string;
  url: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

// Types for database items
export type PageItem = typeof pages.$inferSelect;
export type TodoItem = typeof todos.$inferSelect;
export type EventItem = typeof calendarEvents.$inferSelect;
export type DiagramItem = typeof diagrams.$inferSelect;
export type FolderItem = typeof folders.$inferSelect;

export type SearchData = {
  pages: PageItem[];
  todos: TodoItem[];
  events: EventItem[];
  diagrams: DiagramItem[];
  folders: FolderItem[];
};
