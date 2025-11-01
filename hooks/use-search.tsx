"use client";

import { quickSearchAction, searchAction } from "@/actions/searchActions";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useRef, useState, useEffect } from "react";

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
export type SearchSchemaType =
  | "pages"
  | "todos"
  | "events"
  | "diagrams"
  | "folders";


const convertSearchTypesToSchemaTypes = (
  types: SearchType[],
): SearchSchemaType[] => {
  return types.map((type) => {
    switch (type) {
      case "page":
        return "pages";
      case "todo":
        return "todos";
      case "event":
        return "events";
      case "diagram":
        return "diagrams";
      case "folder":
        return "folders";
      default:
        return "pages" as SearchSchemaType;
    }
  });
};

export type SearchCollectionType = SearchSchemaType;

export interface FuseOptions {
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

export interface SearchScoreWeights {
  title: number;
  description: number;
  content: number;
  tags: number;
  metadata: number;
}

export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  responseTime: number;
  selectedResult?: string;
  timestamp: Date;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

export interface SearchPreferences {
  maxResults: number;
  searchDelay: number;
  enableFuzzySearch: boolean;
  searchWeights: SearchScoreWeights;
  autoRefresh: boolean;
}

export const useSearch = () => {
  const [localResults, setLocalResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { execute, result, status } = useAction(searchAction, {
    onSuccess: (data) => {
      if (data.data?.success && data.data.data) {
        setLocalResults(data.data.data.results || []);
      } else {
        setLocalResults([]);
      }
    },
    onError: () => {
      setLocalResults([]);
    },
  });

  const { execute: quickExecute, result: quickResult } = useAction(
    quickSearchAction,
    {
      onSuccess: (data) => {
        if (data.data?.success && data.data.data) {
          setLocalResults(data.data.data.results || []);
        }
      },
      onError: () => {
        setLocalResults([]);
      },
    },
  );

  const search = useCallback(
    (
      query: string,
      types?: SearchType[],
      limit?: number,
      immediate: boolean = false,
    ) => {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      setSearchQuery(query);

      if (query.trim().length < 2) {
        setLocalResults([]);
        return;
      }

      const searchTypes = types || [
        "page",
        "todo",
        "event",
        "diagram",
        "folder",
      ];
      const searchLimit = limit || 10;

      // Konverzia typov pre schému
      const schemaTypes = convertSearchTypesToSchemaTypes(searchTypes);

      if (immediate) {
        execute({
          query: query.trim(),
          types: schemaTypes,
          limit: searchLimit,
        });
      } else {
        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
          execute({
            query: query.trim(),
            types: schemaTypes,
            limit: searchLimit,
          });
        }, 300);
      }
    },
    [execute],
  );

  const quickSearch = useCallback(
    (query: string) => {
      if (query.trim().length < 2) {
        setLocalResults([]);
        return;
      }

      quickExecute({ query: query.trim() });
    },
    [quickExecute],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Use results from either search or quick search
  const results: SearchResult[] =
    (result.data?.data?.results ? result.data.data.results : []) ??
    (quickResult.data?.data?.results ? quickResult.data.data.results : []) ??
    localResults;

  return {
    search,
    quickSearch,
    results,
    loading: status === "executing",
    error: result.serverError ?? quickResult.serverError ?? null,
    data: result.data ?? quickResult.data ?? null,
    searchQuery,
  };
};
