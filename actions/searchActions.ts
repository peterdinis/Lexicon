"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import Fuse from "fuse.js";
import { db } from "@/drizzle/db";
import {
  pages,
  todos,
  calendarEvents,
  diagrams,
  folders,
} from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { searchSchema, quickSearchSchema } from "./schemas/searchSchemas";
import { fetchUser } from "./authActions";

// Base types
export type SearchType = "page" | "todo" | "event" | "diagram" | "folder";

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

// Database item types - UPDATED to match actual database schema
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
  completed: boolean | null; // Made nullable
  priority: string | null; // Made nullable
  due_date?: Date | null;
  created_at: Date | null; // Made nullable
  updated_at: Date | null; // Made nullable
  user_id: string;
  status?: string | null; // Added missing field
  notes?: string | null; // Added missing field
}

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  start_time: Date;
  end_time: Date;
  all_day: boolean | null; // Made nullable
  color?: string | null; // Added missing field
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

export interface CachedSearchData {
  pages: PageItem[];
  todos: TodoItem[];
  events: EventItem[];
  diagrams: DiagramItem[];
  folders: FolderItem[];
}

type SearchableItem =
  | PageItem
  | TodoItem
  | EventItem
  | DiagramItem
  | FolderItem;

// Cache management
let cachedSearchData: CachedSearchData | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fuse.js options
const fuseOptions = {
  keys: ["title", "description"],
  threshold: 0.6,
  includeScore: true,
  minMatchCharLength: 1,
  useExtendedSearch: true,
  ignoreLocation: true,
  distance: 100,
};

// URL mapping
const urlMap: Record<SearchType, (item: { id: string }) => string> = {
  page: (item) => `/page/${item.id}`,
  todo: (item) => `/todos#todo-${item.id}`,
  event: (item) => `/calendar#event-${item.id}`,
  diagram: (item) => `/diagrams/${item.id}`,
  folder: (item) => `/folder/${item.id}`,
};

async function loadSearchData(userId: string): Promise<CachedSearchData> {
  const now = Date.now();

  if (cachedSearchData && now - lastCacheUpdate < CACHE_TTL) {
    return cachedSearchData;
  }

  try {
    // Use type assertions to handle database type mismatches
    const [pagesData, todosData, eventsData, diagramsData, foldersData] =
      await Promise.all([
        // Pages query
        db
          .select()
          .from(pages)
          .where(and(eq(pages.user_id, userId), eq(pages.in_trash, false)))
          .orderBy(desc(pages.updated_at))
          .limit(1000)
          .then((data) => data as PageItem[])
          .catch((error) => {
            console.error("Error loading pages:", error);
            return [] as PageItem[];
          }),

        // Todos query - with proper type handling
        db
          .select()
          .from(todos)
          .where(eq(todos.user_id, userId))
          .orderBy(desc(todos.updated_at))
          .limit(1000)
          .then((data) => {
            // Transform and validate todo items
            return data.map((todo) => ({
              id: todo.id,
              title: todo.title,
              description: todo.description,
              completed: todo.completed ?? false, // Provide default value
              priority: todo.priority ?? "medium", // Provide default value
              due_date: todo.due_date,
              created_at: todo.created_at ?? new Date(), // Provide default value
              updated_at: todo.updated_at ?? new Date(), // Provide default value
              user_id: todo.user_id,
              status: todo.status,
              notes: todo.notes,
            })) as TodoItem[];
          })
          .catch((error) => {
            console.error("Error loading todos:", error);
            return [] as TodoItem[];
          }),

        // Events query - with proper type handling
        db
          .select()
          .from(calendarEvents)
          .where(
            and(
              eq(calendarEvents.user_id, userId),
              eq(calendarEvents.in_trash, false),
            ),
          )
          .orderBy(desc(calendarEvents.updated_at))
          .limit(1000)
          .then((data) => {
            // Transform and validate event items
            return data.map((event) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              start_time: event.start_time,
              end_time: event.end_time,
              all_day: event.all_day ?? false, // Provide default value
              color: event.color,
              created_at: event.created_at,
              updated_at: event.updated_at,
              user_id: event.user_id,
              in_trash: event.in_trash,
            })) as EventItem[];
          })
          .catch((error) => {
            console.error("Error loading events:", error);
            return [] as EventItem[];
          }),

        // Diagrams query
        db
          .select()
          .from(diagrams)
          .where(
            and(eq(diagrams.user_id, userId), eq(diagrams.in_trash, false)),
          )
          .orderBy(desc(diagrams.updated_at))
          .limit(1000)
          .then((data) => data as DiagramItem[])
          .catch((error) => {
            console.error("Error loading diagrams:", error);
            return [] as DiagramItem[];
          }),

        // Folders query
        db
          .select()
          .from(folders)
          .where(and(eq(folders.user_id, userId), eq(folders.in_trash, false)))
          .orderBy(desc(folders.updated_at))
          .limit(1000)
          .then((data) => data as FolderItem[])
          .catch((error) => {
            console.error("Error loading folders:", error);
            return [] as FolderItem[];
          }),
      ]);

    cachedSearchData = {
      pages: pagesData,
      todos: todosData,
      events: eventsData,
      diagrams: diagramsData,
      folders: foldersData,
    };

    lastCacheUpdate = now;
    return cachedSearchData;
  } catch (error) {
    console.error("❌ Error loading search data:", error);
    // Return empty data structure with proper typing
    const emptyData: CachedSearchData = {
      pages: [],
      todos: [],
      events: [],
      diagrams: [],
      folders: [],
    };
    return emptyData;
  }
}

function getMetadataForItem(
  type: SearchType,
  item: SearchableItem,
): Record<string, unknown> {
  const baseMetadata = {
    created_at: item.created_at,
    updated_at: item.updated_at,
  };

  switch (type) {
    case "page":
      const pageItem = item as PageItem;
      return {
        ...baseMetadata,
        is_folder: pageItem.is_folder,
        icon: pageItem.icon,
      };
    case "todo":
      const todoItem = item as TodoItem;
      return {
        ...baseMetadata,
        completed: todoItem.completed,
        priority: todoItem.priority,
        due_date: todoItem.due_date,
        status: todoItem.status,
      };
    case "event":
      const eventItem = item as EventItem;
      return {
        ...baseMetadata,
        start_time: eventItem.start_time,
        end_time: eventItem.end_time,
        all_day: eventItem.all_day,
        color: eventItem.color,
      };
    case "diagram":
      const diagramItem = item as DiagramItem;
      return {
        ...baseMetadata,
        description: diagramItem.description,
      };
    case "folder":
      return baseMetadata;
    default:
      return baseMetadata;
  }
}

function createSearchResult(
  item: SearchableItem,
  type: SearchType,
  score?: number,
): SearchResult {
  // Get appropriate icon based on type
  const getIcon = (): string => {
    switch (type) {
      case "page":
        const pageItem = item as PageItem;
        return pageItem.icon || "file";
      case "todo":
        return "check-circle";
      case "event":
        return "calendar";
      case "diagram":
        return "layout";
      case "folder":
        return "folder";
      default:
        return "file";
    }
  };

  return {
    id: item.id,
    type,
    title:
      item.title || `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    icon: getIcon(),
    url: urlMap[type]({ id: item.id }),
    score,
    metadata: getMetadataForItem(type, item),
  };
}

function searchInCollection(
  data: SearchableItem[],
  query: string,
  type: SearchType,
  limit: number,
): SearchResult[] {
  if (!data || data.length === 0 || !query.trim()) {
    return [];
  }

  try {
    const fuse = new Fuse(data, fuseOptions);
    const searchResults = fuse.search(query, { limit });

    return searchResults.map((result): SearchResult => {
      return createSearchResult(result.item, type, result.score);
    });
  } catch (error) {
    console.error(`❌ Error searching in ${type}:`, error);
    return simpleSearch(data, query, type, limit);
  }
}

function simpleSearch(
  data: SearchableItem[],
  query: string,
  type: SearchType,
  limit: number,
): SearchResult[] {
  if (!data || data.length === 0 || !query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();

  return data
    .filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(lowerQuery);
      return titleMatch;
    })
    .slice(0, limit)
    .map((item) => createSearchResult(item, type));
}

// Helper to get data by type
function getDataByType(
  searchData: CachedSearchData,
  type: SearchType,
): SearchableItem[] {
  switch (type) {
    case "page":
      return searchData.pages;
    case "todo":
      return searchData.todos;
    case "event":
      return searchData.events;
    case "diagram":
      return searchData.diagrams;
    case "folder":
      return searchData.folders;
    default:
      return [];
  }
}

export const searchAction = actionClient
  .inputSchema(searchSchema)
  .action(
    async ({
      parsedInput: { query, limit, types },
    }): Promise<SearchResponse> => {
      try {
        if (query.trim().length < 1) {
          return {
            success: true,
            data: {
              results: [],
              total: 0,
              query,
            },
          };
        }

        const user = await fetchUser();
        const searchData = await loadSearchData(user.id);

        const results: SearchResult[] = [];

        for (const type of types) {
          const data = getDataByType(searchData, type as SearchType);
          if (data && data.length > 0) {
            const typeResults = searchInCollection(
              data,
              query,
              type as SearchType,
              Math.ceil(limit / types.length),
            );
            results.push(...typeResults);
          }
        }

        const sortedResults = results
          .filter((result) => result.score !== undefined)
          .sort((a, b) => (a.score || 1) - (b.score || 1))
          .slice(0, limit);

        return {
          success: true,
          data: {
            results: sortedResults,
            total: sortedResults.length,
            query,
          },
        };
      } catch (error) {
        console.error("❌ Search action error:", error);
        return {
          success: false,
          error: getErrorMessage(error),
          data: {
            results: [],
            total: 0,
            query,
          },
        };
      }
    },
  );

export const quickSearchAction = actionClient
  .inputSchema(quickSearchSchema)
  .action(async ({ parsedInput: { query } }): Promise<QuickSearchResponse> => {
    try {
      if (query.trim().length < 1) {
        return {
          success: true,
          data: {
            results: [],
            total: 0,
            query,
          },
        };
      }

      const user = await fetchUser();
      const searchData = await loadSearchData(user.id);

      const quickTypes: SearchType[] = ["page", "todo", "event"];
      const results: SearchResult[] = [];

      for (const type of quickTypes) {
        const data = getDataByType(searchData, type);
        if (data && data.length > 0) {
          const typeResults = searchInCollection(data, query, type, 3);
          results.push(...typeResults);
        }
      }

      const sortedResults = results
        .filter((result) => result.score !== undefined)
        .sort((a, b) => (a.score || 1) - (b.score || 1))
        .slice(0, 5);

      return {
        success: true,
        data: {
          results: sortedResults,
          total: sortedResults.length,
          query,
        },
      };
    } catch (error) {
      console.error("❌ Quick search error:", error);
      return {
        success: false,
        error: getErrorMessage(error),
        data: {
          results: [],
          total: 0,
          query,
        },
      };
    }
  });

export async function invalidateSearchCache(): Promise<void> {
  cachedSearchData = null;
  lastCacheUpdate = 0;
}
