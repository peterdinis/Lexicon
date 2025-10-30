// searchTypes.ts

// Base item types
export interface BaseItem {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  user_id: string;
}

export interface PageItem extends BaseItem {
  coverImage?: string | null;
  parent_id?: string | null;
  is_folder: boolean;
  in_trash: boolean;
}

export interface TodoItem extends BaseItem {
  completed: boolean | null;
  priority: string | null;
  due_date: Date | null;
  status: string | null;
  notes?: string | null;
  tags?: string | null;
  // Note: todos table doesn't have in_trash field
}

export interface EventItem extends BaseItem {
  start_time: Date;
  end_time: Date;
  all_day: boolean | null;
  color?: string | null;
  in_trash: boolean;
}

export interface DiagramItem extends BaseItem {
  nodes: any[];
  edges: any[];
  viewport: any;
  deleted_at: Date | null;
  in_trash: boolean;
}

export interface FolderItem extends BaseItem {
  in_trash: boolean;
}

// Search types
export type SearchType = "page" | "todo" | "event" | "diagram" | "folder";
export type SearchCollectionType =
  | "pages"
  | "todos"
  | "events"
  | "diagrams"
  | "folders";
export type QuickSearchType = "pages" | "todos" | "events";

// Search result type
export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  description?: string;
  icon?: string;
  url: string;
  score?: number;
  metadata: Record<string, unknown>;
}

// Search data structure
export interface SearchData {
  pages: PageItem[];
  todos: TodoItem[];
  events: EventItem[];
  diagrams: DiagramItem[];
  folders: FolderItem[];
}

// Fuse.js options
export interface FuseOptions {
  keys: string[];
  threshold: number;
  includeScore: boolean;
  minMatchCharLength: number;
  useExtendedSearch: boolean;
  ignoreLocation: boolean;
  distance: number;
}

// Response data types
export interface SearchResultsData {
  results: SearchResult[];
  total: number;
  query: string;
}

export interface SearchResponse {
  success: boolean;
  error?: string;
  data: SearchResultsData;
}

export interface QuickSearchResponse {
  success: boolean;
  error?: string;
  data: SearchResultsData;
}
