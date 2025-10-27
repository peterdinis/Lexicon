"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import Fuse from "fuse.js";
import { db } from "@/drizzle/db";
import {
  pages,
  blocks,
  todos,
  calendarEvents,
  diagrams,
  folders,
} from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { searchSchema } from "./schemas/searchSchemas";
import { fetchUser } from "./authActions";
import { error } from "console";

// Types for search results
export type SearchResult = {
  id: string;
  type: "page" | "block" | "todo" | "event" | "diagram" | "folder";
  title: string;
  description?: string;
  content?: string;
  icon?: string;
  url: string;
  score?: number;
  metadata?: Record<string, any>;
};

// Types for database items
type PageItem = typeof pages.$inferSelect;
type BlockItem = typeof blocks.$inferSelect & { searchableContent: string };
type TodoItem = typeof todos.$inferSelect;
type EventItem = typeof calendarEvents.$inferSelect;
type DiagramItem = typeof diagrams.$inferSelect;
type FolderItem = typeof folders.$inferSelect;

type SearchData = {
  pages: PageItem[];
  blocks: BlockItem[];
  todos: TodoItem[];
  events: EventItem[];
  diagrams: DiagramItem[];
  folders: FolderItem[];
};

const fuseInstances = new Map();

let cachedSearchData: SearchData | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minút

// More lenient Fuse.js options
const fuseOptions = {
  pages: {
    keys: ["title", "description"],
    threshold: 0.6, // Increased threshold for more results
    includeScore: true,
    minMatchCharLength: 1, // Reduced to 1 character
    useExtendedSearch: true,
    ignoreLocation: true,
    distance: 100, // Increased distance
  },
  blocks: {
    keys: ["searchableContent"],
    threshold: 0.7, // More lenient for content
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

async function loadSearchData(userId: string): Promise<SearchData> {
  const now = Date.now();

  if (cachedSearchData && now - lastCacheUpdate < CACHE_TTL) {
    return cachedSearchData;
  }

  try {
    const [
      pagesData,
      blocksData,
      todosData,
      eventsData,
      diagramsData,
      foldersData,
    ] = await Promise.all([
      db
        .select()
        .from(pages)
        .where(and(eq(pages.user_id, userId), eq(pages.in_trash, 1)))
        .orderBy(desc(pages.updated_at))
        .limit(1000)
        .catch((error) => {
          console.error("Error loading pages:", error);
          return [];
        }),
      db
        .select()
        .from(blocks)
        .where(and(eq(blocks.in_trash, 1)))
        .orderBy(desc(blocks.updated_at))
        .limit(2000)
        .then((blocks) =>
          blocks.map((block) => ({
            ...block,
            searchableContent: extractSearchableContent(block.content),
          })),
        )
        .catch((error) => {
          console.error("Error loading blocks:", error);
          return [];
        }),

      // Todos - Check if todos has user_id
      db
        .select()
        .from(todos)
        .where(eq(todos.user_id, userId))
        .orderBy(desc(todos.updated_at))
        .limit(1000)
        .catch((error) => {
          console.error("Error loading todos:", error);
          return [];
        }),

      // Events
      db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.user_id, userId),
            eq(calendarEvents.in_trash, 1),
          ),
        )
        .orderBy(desc(calendarEvents.updated_at))
        .limit(1000)
        .catch((error) => {
          console.error("Error loading events:", error);
          return [];
        }),

      // Diagrams
      db
        .select()
        .from(diagrams)
        .where(and(eq(diagrams.user_id, userId), eq(diagrams.in_trash, 1)))
        .orderBy(desc(diagrams.updated_at))
        .limit(1000)
        .catch((error) => {
          console.error("Error loading diagrams:", error);
          return [];
        }),

      // Folders
      db
        .select()
        .from(folders)
        .where(and(eq(folders.user_id, userId), eq(folders.in_trash, 1)))
        .orderBy(desc(folders.updated_at))
        .limit(1000)
        .catch((error) => {
          console.error("Error loading folders:", error);
          return [];
        }),
    ]);

    cachedSearchData = {
      pages: pagesData,
      blocks: blocksData,
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
      blocks: [],
      todos: [],
      events: [],
      diagrams: [],
      folders: [],
    };
  }
}

// Improved content extraction
function extractSearchableContent(content: any): string {
  if (!content) return "";

  try {
    // If it's already a string, try to parse as JSON
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        return extractContentFromObject(parsed);
      } catch {
        // If it's not JSON, return as is
        return content;
      }
    }

    // If it's an object, extract content
    if (typeof content === "object") {
      return extractContentFromObject(content);
    }

    return String(content);
  } catch {
    return String(content);
  }
}

function extractContentFromObject(obj: any): string {
  if (!obj) return "";

  if (typeof obj === "string") return obj;
  if (obj.text) return obj.text;
  if (obj.content) return obj.content;
  if (obj.title) return obj.title;
  if (obj.description) return obj.description;

  if (Array.isArray(obj)) {
    return obj
      .map((item) => extractContentFromObject(item))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof obj === "object") {
    return Object.values(obj)
      .map((value) => extractContentFromObject(value))
      .filter(Boolean)
      .join(" ");
  }

  return String(obj);
}

function getUrlForType(type: string, item: any): string {
  const urls = {
    page: `/page/${item.id}`,
    block: `/page/${item.page_id}#block-${item.id}`,
    todo: `/todos#todo-${item.id}`,
    event: `/calendar#event-${item.id}`,
    diagram: `/diagrams/${item.id}`,
    folder: `/folder/${item.id}`,
  };
  return urls[type as keyof typeof urls] || "/";
}

function getMetadataForType(type: string, item: any): Record<string, any> {
  const metadata: Record<string, any> = {
    created_at: item.created_at,
    updated_at: item.updated_at,
  };

  switch (type) {
    case "page":
      metadata.is_folder = item.is_folder;
      break;
    case "block":
      metadata.type = item.type;
      metadata.position = item.position;
      break;
    case "todo":
      metadata.completed = item.completed;
      metadata.priority = item.priority;
      metadata.due_date = item.due_date;
      break;
    case "event":
      metadata.start_time = item.start_time;
      metadata.end_time = item.end_time;
      metadata.all_day = item.all_day;
      break;
  }

  return metadata;
}

function createPageResult(item: PageItem, score?: number): SearchResult {
  return {
    id: item.id,
    type: "page",
    title: item.title || "Untitled Page",
    description: item.description || undefined,
    icon: item.icon as string | undefined,
    url: getUrlForType("page", item),
    score,
    metadata: getMetadataForType("page", item),
  };
}

function createBlockResult(item: BlockItem, score?: number): SearchResult {
  return {
    id: item.id,
    type: "block",
    title: "Content Block",
    content: item.searchableContent?.substring(0, 200) || undefined,
    url: getUrlForType("block", item),
    score,
    metadata: getMetadataForType("block", item),
  };
}

function createTodoResult(item: TodoItem, score?: number): SearchResult {
  return {
    id: item.id,
    type: "todo",
    title: item.title || "Untitled Todo",
    description: item.description as string | undefined,
    url: getUrlForType("todo", item),
    score,
    metadata: getMetadataForType("todo", item),
  };
}

function createEventResult(item: EventItem, score?: number): SearchResult {
  return {
    id: item.id,
    type: "event",
    title: item.title || "Untitled Event",
    description: item.description as string | undefined,
    url: getUrlForType("event", item),
    score,
    metadata: getMetadataForType("event", item),
  };
}

function createDiagramResult(item: DiagramItem, score?: number): SearchResult {
  return {
    id: item.id,
    type: "diagram",
    title: item.title || "Untitled Diagram",
    description: item.description as string | undefined,
    url: getUrlForType("diagram", item),
    score,
    metadata: getMetadataForType("diagram", item),
  };
}

function createFolderResult(item: FolderItem, score?: number): SearchResult {
  return {
    id: item.id,
    type: "folder",
    title: item.title || "Untitled Folder",
    url: getUrlForType("folder", item),
    score,
    metadata: getMetadataForType("folder", item),
  };
}

// Mapovanie typov na funkcie pre vytvorenie výsledkov
const resultCreators = {
  pages: createPageResult,
  blocks: createBlockResult,
  todos: createTodoResult,
  events: createEventResult,
  diagrams: createDiagramResult,
  folders: createFolderResult,
};

// Improved search function with better error handling
function searchInCollection(
  data: any[],
  query: string,
  type: string,
  limit: number,
): SearchResult[] {
  if (!data || data.length === 0) {
    return [];
  }

  try {
    const fuse = new Fuse(data, fuseOptions[type as keyof typeof fuseOptions]);
    const searchResults = fuse.search(query, { limit });

    const results = searchResults.map((result): SearchResult => {
      const creator = resultCreators[type as keyof typeof resultCreators];
      if (!creator) {
        console.warn(`Unknown type: ${type}`);
        return {
          id: result.item.id,
          type: "page" as any,
          title: "Unknown Item",
          url: "/",
          score: result.score,
        };
      }

      return creator(result.item, result.score);
    });
    return results;
  } catch (error) {
    console.error(`❌ Error searching in ${type}:`, error);
    return [];
  }
}

// Simple fallback search for debugging
function simpleSearch(
  data: any[],
  query: string,
  type: string,
  limit: number,
): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const filtered = data
    .filter((item) => {
      if (item.title && item.title.toLowerCase().includes(lowerQuery))
        return true;
      if (
        item.description &&
        item.description.toLowerCase().includes(lowerQuery)
      )
        return true;
      if (
        type === "blocks" &&
        item.searchableContent &&
        item.searchableContent.toLowerCase().includes(lowerQuery)
      )
        return true;
      return false;
    })
    .slice(0, limit);

  return filtered.map((item) => {
    const creator = resultCreators[type as keyof typeof resultCreators];
    return creator ? creator(item) : createPageResult(item);
  });
}

// Optimalizovaná search action
export const searchAction = actionClient
  .schema(searchSchema)
  .action(async ({ parsedInput: { query, limit, types } }) => {
    try {
      // Skontrolovať dĺžku query
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
      const userId = user.id;
      // Načítať všetky dáta naraz
      const searchData = await loadSearchData(userId);

      const results: SearchResult[] = [];

      // Search in each type
      for (const type of types) {
        const data = searchData[type as keyof SearchData];
        if (data && data.length > 0) {
          const typeResults = searchInCollection(
            data,
            query,
            type,
            Math.ceil(limit / types.length),
          );

          // Fallback to simple search if no results
          if (typeResults.length === 0) {
            const simpleResults = simpleSearch(
              data,
              query,
              type,
              Math.ceil(limit / types.length),
            );
            results.push(...simpleResults);
          } else {
            results.push(...typeResults);
          }
        } else {
          throw new Error("Something went wrong");
        }
      }

      // Zoradiť a limitovať výsledky
      const sortedResults = results
        .filter((result) => result && result.score !== undefined)
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

// Rýchle vyhľadávanie
export const quickSearchAction = actionClient
  .schema(
    z.object({
      query: z.string().min(1, "Query must be at least 1 character long"),
    }),
  )
  .action(async ({ parsedInput: { query } }) => {
    try {
      if (query.length < 1) {
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

      // Vyhľadávať len v najdôležitejších typoch
      const quickTypes = ["pages", "todos", "events"] as const;
      const results: SearchResult[] = [];

      quickTypes.forEach((type) => {
        const data = searchData[type];
        if (data && data.length > 0) {
          const typeResults = searchInCollection(data, query, type, 3);
          results.push(...typeResults);
        }
      });

      const sortedResults = results
        .filter((result) => result && result.score !== undefined)
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

// Funkcia pre invalidáciu cache
export async function invalidateSearchCache() {
  cachedSearchData = null;
  fuseInstances.clear();
  lastCacheUpdate = 0;
}
