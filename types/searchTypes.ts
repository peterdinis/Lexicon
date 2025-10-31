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

export interface SearchResponse {
  success: boolean;
  error?: string;
  data: {
    results: SearchResult[];
    total: number;
    query: string;
  };
}

export interface QuickSearchResponse {
  success: boolean;
  error?: string;
  data: {
    results: SearchResult[];
    total: number;
    query: string;
  };
}

export interface CachedSearchData {
  pages: PageItem[];
  todos: TodoItem[];
  events: EventItem[];
  diagrams: DiagramItem[];
  folders: FolderItem[];
}

export type SearchType = "page" | "todo" | "event" | "diagram" | "folder";

export type SearchCollectionType = "pages" | "todos" | "events" | "diagrams" | "folders";

export interface FuseOptions<T> {
  keys: string[];
  threshold: number;
  includeScore: boolean;
  minMatchCharLength: number;
  useExtendedSearch: boolean;
  ignoreLocation: boolean;
  distance: number;
}

export interface PageItem {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  in_trash: boolean;
  is_folder: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean | null;
  priority: string | null;
  due_date?: Date | null;
  status?: string | null;
  notes?: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  user_id: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  start_time: Date;
  end_time: Date;
  all_day: boolean | null;
  color?: string | null;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  in_trash: boolean;
}

export interface DiagramItem {
  id: string;
  title: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  in_trash: boolean;
}

export interface FolderItem {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  in_trash: boolean;
}

// Search filter types
export interface SearchFilters {
  types?: SearchType[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
  priority?: string[];
  completed?: boolean;
}

// Search context types
export interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  refreshSearch: () => void;
}

// Search ranking and scoring
export interface SearchScoreWeights {
  title: number;
  description: number;
  content: number;
  tags: number;
  metadata: number;
}

// Search analytics
export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  responseTime: number;
  selectedResult?: string;
  timestamp: Date;
}

// Search history item
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

// Search preferences
export interface SearchPreferences {
  maxResults: number;
  searchDelay: number;
  enableFuzzySearch: boolean;
  searchWeights: SearchScoreWeights;
  autoRefresh: boolean;
}