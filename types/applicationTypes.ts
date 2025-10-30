import { ReactNode } from "react";
import {
  pages,
  todos,
  calendarEvents,
  diagrams,
  folders,
} from "@/drizzle/schema";

// types/databaseTypes.ts

// Base types
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserEntity extends BaseEntity {
  user_id: string;
}

// Pages
export interface PageType extends UserEntity {
  title: string;
  description: string;
  icon: string;
  cover_image?: string;
  parent_id?: string;
  is_folder: boolean;
  in_trash: boolean;
}

// Blocks
export interface BlockType extends BaseEntity {
  page_id: string;
  type: string;
  content: Record<string, any>;
  position: number;
  in_trash: boolean;
}

// Folders
export interface FolderType extends UserEntity {
  title: string;
  in_trash: boolean;
}

// Todos
export interface TodoType extends UserEntity {
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  tags?: string;
}

// Calendar Events
export interface CalendarEventType extends UserEntity {
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  all_day: boolean;
  color?: string;
  in_trash: boolean;
}

// Diagrams
export interface DiagramType extends UserEntity {
  title: string;
  description?: string;
  nodes: any[];
  edges: any[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  deleted_at?: Date;
  in_trash: boolean;
}

// Response types
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

// Utility types for data extraction
export type ResponseData<T> = 
  | T 
  | ApiResponse<T> 
  | PaginatedResponse<T> 
  | { data: T };

export function extractData<T>(response: ResponseData<T>): T {
  if (Array.isArray(response)) {
    return response as T;
  }
  
  if (typeof response === 'object' && response !== null) {
    if ('data' in response) {
      return (response as any).data;
    }
    if ('success' in response) {
      return (response as any).data;
    }
  }
  
  return response as T;
}

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

export type CheckEmailResponse = { exists: boolean };

export interface Diagram {
  id: string;
  user_id: string;
  title: string;
  description: string | null; 
  nodes: unknown;
  edges: unknown;
  viewport:any;
  deleted_at?: any;
  created_at: Date | string;
  updated_at: Date | string;
}

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
  metadata?: Record<string, any>;
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
