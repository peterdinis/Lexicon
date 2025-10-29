export interface PageItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  cover_image: string | null;
  parent_id: string | null;
  is_folder: boolean;
  in_trash: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface TodoItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean | null;
  priority: string | null;
  due_date: Date | null;
  status: string | null;
  notes: string | null;
  tags: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface EventItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: Date;
  end_time: Date;
  all_day: boolean | null;
  color: string | null;
  in_trash: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface DiagramItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  nodes: any;
  edges: any;
  viewport: any;
  deleted_at: Date | null;
  in_trash: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface FolderItem {
  id: string;
  user_id: string;
  title: string;
  parent_id: string | null;
  in_trash: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}

// Base interface pre vyhľadávanie
export interface BaseSearchItem {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export type SearchType = "page" | "todo" | "event" | "diagram" | "folder";

// Fuse options type
export interface FuseOptions {
  keys: string[];
  threshold: number;
  includeScore: boolean;
  minMatchCharLength: number;
  useExtendedSearch: boolean;
  ignoreLocation: boolean;
  distance: number;
}
