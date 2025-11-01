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

export type ExtractableResponse<T> =
  | T
  | BaseResponse<T>
  | SuccessResponse<T>
  | DataResponse<T>
  | T[];

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
