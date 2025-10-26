export interface Page {
  children?(children: any, arg1: number): unknown;
  id: string;
  user_id: string;
  title: string;
  content?: string;
  icon?: string;
  cover_image?: string;
  parent_id?: string | null;
  is_folder?: number;
  deleted_at?: string | null;
  created_at: any;
  updated_at: string;
}

export interface Block {
  id: string;
  page_id: string;
  type: "text" | "heading" | "todo" | "code" | "divider";
  content: {
    text?: string;
    checked?: boolean;
    language?: string;
  };
  position: number;
  created_at: string;
  updated_at: string;
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
export interface PageShare {
  id: string;
  page_id: string;
  shared_by: string;
  shared_with_email?: string;
  permission: "view" | "comment" | "edit";
  is_public: boolean;
  public_token?: string;
  created_at: string;
  updated_at: string;
}

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

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "page_shared"
    | "todo_due"
    | "calendar_event"
    | "comment"
    | "mention"
    | "system";
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}
