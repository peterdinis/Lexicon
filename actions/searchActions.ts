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
import type {
  PageItem,
  TodoItem,
  EventItem,
  DiagramItem,
  FolderItem,
  SearchType,
  FuseOptions,
  SearchResult,
  SearchCollectionType,
  QuickSearchType,
  SearchData,
  SearchResponse,
  QuickSearchResponse,
  SearchResultsData,
} from "@/types/searchTypes";

// Cache management
let cachedSearchData: SearchData | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Type-safe Fuse.js options
const fuseOptions: Record<SearchCollectionType, FuseOptions> = {
  pages: {
    keys: ["title", "description"],
    threshold: 0.6,
    includeScore: true,
    minMatchCharLength: 1,
    useExtendedSearch: true,
    ignoreLocation: true,
    distance: 100,
  },
  todos: {
    keys: ["title", "description"],
    threshold: 0.6,
    includeScore: true,
    minMatchCharLength: 1,
    useExtendedSearch: true,
    ignoreLocation: true,
    distance: 100,
  },
  events: {
    keys: ["title", "description"],
    threshold: 0.6,
    includeScore: true,
    minMatchCharLength: 1,
    useExtendedSearch: true,
    ignoreLocation: true,
    distance: 100,
  },
  diagrams: {
    keys: ["title", "description"],
    threshold: 0.6,
    includeScore: true,
    minMatchCharLength: 1,
    useExtendedSearch: true,
    ignoreLocation: true,
    distance: 100,
  },
  folders: {
    keys: ["title"],
    threshold: 0.6,
    includeScore: true,
    minMatchCharLength: 1,
    useExtendedSearch: true,
    ignoreLocation: true,
    distance: 100,
  },
};

// URL mapping
const urlMap: Record<SearchType, (item: { id: string }) => string> = {
  page: (item) => `/page/${item.id}`,
  todo: (item) => `/todos#todo-${item.id}`,
  event: (item) => `/calendar#event-${item.id}`,
  diagram: (item) => `/diagrams/${item.id}`,
  folder: (item) => `/folder/${item.id}`,
};

// Helper function to convert SearchType to SearchCollectionType
function toCollectionType(type: SearchType): SearchCollectionType {
  const mapping: Record<SearchType, SearchCollectionType> = {
    page: "pages",
    todo: "todos", 
    event: "events",
    diagram: "diagrams",
    folder: "folders"
  };
  return mapping[type];
}

async function loadSearchData(userId: string): Promise<SearchData> {
  const now = Date.now();

  if (cachedSearchData && now - lastCacheUpdate < CACHE_TTL) {
    return cachedSearchData;
  }

  try {
    const [pagesData, todosData, eventsData, diagramsData, foldersData] =
      await Promise.all([
        // Pages - fixed in_trash default value
        db
          .select()
          .from(pages)
          .where(and(eq(pages.user_id, userId), eq(pages.in_trash, false)))
          .orderBy(desc(pages.updated_at))
          .limit(1000)
          .catch((error) => {
            console.error("Error loading pages:", error);
            return [] as PageItem[];
          }),

        // Todos - no in_trash field, using all todos
        db
          .select()
          .from(todos)
          .where(eq(todos.user_id, userId))
          .orderBy(desc(todos.updated_at))
          .limit(1000)
          .catch((error) => {
            console.error("Error loading todos:", error);
            return [] as TodoItem[];
          }),

        // Calendar Events - fixed in_trash default value
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
          .catch((error) => {
            console.error("Error loading events:", error);
            return [] as EventItem[];
          }),

        // Diagrams - fixed in_trash default value
        db
          .select()
          .from(diagrams)
          .where(
            and(eq(diagrams.user_id, userId), eq(diagrams.in_trash, false)),
          )
          .orderBy(desc(diagrams.updated_at))
          .limit(1000)
          .catch((error) => {
            console.error("Error loading diagrams:", error);
            return [] as DiagramItem[];
          }),

        // Folders - fixed in_trash default value
        db
          .select()
          .from(folders)
          .where(and(eq(folders.user_id, userId), eq(folders.in_trash, false)))
          .orderBy(desc(folders.updated_at))
          .limit(1000)
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
    return {
      pages: [],
      todos: [],
      events: [],
      diagrams: [],
      folders: [],
    };
  }
}

function getMetadataForItem(
  type: SearchType,
  item: PageItem | TodoItem | EventItem | DiagramItem | FolderItem,
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
        parent_id: pageItem.parent_id,
        coverImage: pageItem.coverImage,
      };
    case "todo":
      const todoItem = item as TodoItem;
      return {
        ...baseMetadata,
        completed: todoItem.completed,
        priority: todoItem.priority,
        due_date: todoItem.due_date,
        status: todoItem.status,
        tags: todoItem.tags,
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
        deleted_at: diagramItem.deleted_at,
      };
    default:
      return baseMetadata;
  }
}

function createSearchResult<T extends { id: string; title: string; description?: string | null; icon?: string | null }>(
  item: T,
  type: SearchType,
  score?: number,
): SearchResult {
  return {
    id: item.id,
    type,
    title: item.title || `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    description: item.description || undefined,
    icon: item.icon || undefined,
    url: urlMap[type]({ id: item.id }),
    score,
    metadata: getMetadataForItem(type, item as unknown as PageItem | TodoItem | EventItem | DiagramItem | FolderItem),
  };
}

function searchInCollection<T>(
  data: T[],
  query: string,
  type: SearchCollectionType,
  limit: number,
): SearchResult[] {
  if (!data || data.length === 0 || !query.trim()) {
    return [];
  }

  try {
    const options = fuseOptions[type];
    const fuse = new Fuse(data, options);
    const searchResults = fuse.search(query, { limit });

    // Convert collection type to singular search type
    const searchType = type.slice(0, -1) as SearchType;
    
    return searchResults.map((result): SearchResult => {
      return createSearchResult(result.item, searchType, result.score);
    });
  } catch (error) {
    console.error(`❌ Error searching in ${type}:`, error);
    const searchType = type.slice(0, -1) as SearchType;
    return simpleSearch(data, query, searchType, limit);
  }
}

function simpleSearch<T>(
  data: T[],
  query: string,
  type: SearchType,
  limit: number,
): SearchResult[] {
  if (!data || data.length === 0 || !query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();

  const filteredResults = data
    .filter((item) => {
      const baseItem = item as { title?: string; description?: string | null };
      return (
        baseItem.title?.toLowerCase().includes(lowerQuery) ||
        baseItem.description?.toLowerCase().includes(lowerQuery)
      );
    })
    .slice(0, limit);

  return filteredResults.map((item) => createSearchResult(
    item as { id: string; title: string; description?: string | null; icon?: string | null },
    type
  ));
}

export const searchAction = actionClient
  .inputSchema(searchSchema)
  .action(async ({ parsedInput: { query, limit, types } }): Promise<SearchResponse> => {
    try {
      if (query.trim().length < 1) {
        const emptyResults: SearchResultsData = {
          results: [],
          total: 0,
          query,
        };
        return {
          success: true,
          data: emptyResults,
        };
      }

      const user = await fetchUser();
      const searchData = await loadSearchData(user.id);

      const results: SearchResult[] = [];

      for (const type of types) {
        const collectionType = toCollectionType(type);
        const data = searchData[collectionType];
        if (data && data.length > 0) {
          const typeResults = searchInCollection(
            data,
            query,
            collectionType,
            Math.ceil(limit / types.length),
          );
          results.push(...typeResults);
        }
      }

      const sortedResults = results
        .filter((result) => result.score !== undefined)
        .sort((a, b) => (a.score || 1) - (b.score || 1))
        .slice(0, limit);

      const responseData: SearchResultsData = {
        results: sortedResults,
        total: sortedResults.length,
        query,
      };

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error("❌ Search action error:", error);
      const errorData: SearchResultsData = {
        results: [],
        total: 0,
        query,
      };
      return {
        success: false,
        error: getErrorMessage(error),
        data: errorData,
      };
    }
  });

export const quickSearchAction = actionClient
  .inputSchema(quickSearchSchema)
  .action(async ({ parsedInput: { query } }): Promise<QuickSearchResponse> => {
    try {
      if (query.trim().length < 1) {
        const emptyResults: SearchResultsData = {
          results: [],
          total: 0,
          query,
        };
        return {
          success: true,
          data: emptyResults,
        };
      }

      const user = await fetchUser();
      const searchData = await loadSearchData(user.id);

      const quickTypes: QuickSearchType[] = ["pages", "todos", "events"];
      const results: SearchResult[] = [];

      for (const type of quickTypes) {
        const data = searchData[type];
        if (data && data.length > 0) {
          const typeResults = searchInCollection(data, query, type, 3);
          results.push(...typeResults);
        }
      }

      const sortedResults = results
        .filter((result) => result.score !== undefined)
        .sort((a, b) => (a.score || 1) - (b.score || 1))
        .slice(0, 5);

      const responseData: SearchResultsData = {
        results: sortedResults,
        total: sortedResults.length,
        query,
      };

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error("❌ Quick search error:", error);
      const errorData: SearchResultsData = {
        results: [],
        total: 0,
        query,
      };
      return {
        success: false,
        error: getErrorMessage(error),
        data: errorData,
      };
    }
  });

export async function invalidateSearchCache(): Promise<void> {
  cachedSearchData = null;
  lastCacheUpdate = 0;
}