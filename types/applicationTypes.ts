import { ReactNode } from "react";

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
  is_folder?: number;
  deleted_at?: string | null;
  created_at: any;
  updated_at: string;
  in_trash?: number;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: number;
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
  description?: string;
  nodes: unknown[];
  edges: unknown[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  title: string;
  in_trash?: number;
  created_at: string;
  updated_at: string;
}
