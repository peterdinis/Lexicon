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
} from "@/types/searchTypes";
// Cache management
let cachedSearchData: any | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Type-safe Fuse.js options
const fuseOptions: Record<string, FuseOptions> = {
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

async function loadSearchData(userId: string) {
  const now = Date.now();

  if (cachedSearchData && now - lastCacheUpdate < CACHE_TTL) {
    return cachedSearchData;
  }

  try {
    const [pagesData, todosData, eventsData, diagramsData, foldersData] =
      await Promise.all([
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
      return {
        ...baseMetadata,
        is_folder: (item as PageItem).is_folder,
      };
    case "todo":
      const todoItem = item as TodoItem;
      return {
        ...baseMetadata,
        completed: todoItem.completed,
        priority: todoItem.priority,
        due_date: todoItem.due_date,
      };
    case "event":
      const eventItem = item as EventItem;
      return {
        ...baseMetadata,
        start_time: eventItem.start_time,
        end_time: eventItem.end_time,
        all_day: eventItem.all_day,
      };
    default:
      return baseMetadata;
  }
}

function createSearchResult<T>(item: T, type: SearchType, score?: number): any {
  const baseItem = item as {
    id: string;
    title: string;
    description?: string | null;
    icon?: string | null;
  };

  return {
    id: baseItem.id,
    type,
    title:
      baseItem.title ||
      `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    description: baseItem.description || undefined,
    icon: baseItem.icon || undefined,
    url: urlMap[type]({ id: baseItem.id }),
    score,
    metadata: getMetadataForItem(type, item as any),
  };
}

function searchInCollection<T>(
  data: T[],
  query: string,
  type: string,
  limit: number,
): any[] {
  if (!data || data.length === 0 || !query.trim()) {
    return [];
  }

  try {
    const options = fuseOptions[type];
    if (!options) {
      return simpleSearch(data, query, type as SearchType, limit);
    }

    const fuse = new Fuse(data, options);
    const searchResults = fuse.search(query, { limit });

    return searchResults.map((result): any => {
      return createSearchResult(result.item, type as SearchType, result.score);
    });
  } catch (error) {
    console.error(`❌ Error searching in ${type}:`, error);
    return simpleSearch(data, query, type as SearchType, limit);
  }
}

function simpleSearch<T>(
  data: T[],
  query: string,
  type: SearchType,
  limit: number,
): any[] {
  if (!data || data.length === 0 || !query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();

  return data
    .filter((item) => {
      const baseItem = item as { title?: string; description?: string | null };
      return (
        baseItem.title?.toLowerCase().includes(lowerQuery) ||
        baseItem.description?.toLowerCase().includes(lowerQuery)
      );
    })
    .slice(0, limit)
    .map((item) => createSearchResult(item, type));
}

export const searchAction = actionClient
  .inputSchema(searchSchema)
  .action(async ({ parsedInput: { query, limit, types } }) => {
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

      const results: any[] = [];

      for (const type of types) {
        const data = searchData[type as keyof any];
        if (data && data.length > 0) {
          const typeResults = searchInCollection(
            data,
            query,
            type,
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
  });

export const quickSearchAction = actionClient
  .inputSchema(quickSearchSchema)
  .action(async ({ parsedInput: { query } }) => {
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

      const quickTypes = ["pages", "todos", "events"] as const;
      const results: any[] = [];

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

export async function invalidateSearchCache() {
  cachedSearchData = null;
  lastCacheUpdate = 0;
}
