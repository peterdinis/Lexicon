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
import { eq, and } from "drizzle-orm";
import { searchSchema } from "./schemas/searchSchemas";
import { fetchUser } from "./authActions";

// Cache pre Fuse.js inštancie
const fuseInstances = new Map();

// Prednačítané dáta pre rýchlejšie vyhľadávanie
let cachedSearchData: {
  pages: any[];
  blocks: any[];
  todos: any[];
  events: any[];
  diagrams: any[];
  folders: any[];
} | null = null;

let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minút

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

// Optimalizované Fuse.js options
const fuseOptions = {
  pages: {
    keys: ["title", "description"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    ignoreLocation: true,
  },
  blocks: {
    keys: ["searchableContent"],
    threshold: 0.5,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    ignoreLocation: true,
  },
  todos: {
    keys: ["title", "description"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    ignoreLocation: true,
  },
  events: {
    keys: ["title", "description"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    ignoreLocation: true,
  },
  diagrams: {
    keys: ["title", "description"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    ignoreLocation: true,
  },
  folders: {
    keys: ["title"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    ignoreLocation: true,
  },
};

// Funkcia pre načítanie a cache dát
async function loadSearchData(userId: string) {
  const now = Date.now();

  // Vrátiť cache ak je ešte platný
  if (cachedSearchData && now - lastCacheUpdate < CACHE_TTL) {
    return cachedSearchData;
  }

  try {
    // Paralelné načítanie všetkých dát
    const [
      pagesData,
      blocksData,
      todosData,
      eventsData,
      diagramsData,
      foldersData,
    ] = await Promise.all([
      // Pages - OPRAVA: používame 0 namiesto false pre in_trash
      db
        .select()
        .from(pages)
        .where(and(eq(pages.user_id, userId), eq(pages.in_trash, 0)))
        .limit(1000),

      // Blocks - OPRAVA: používame 0 namiesto false pre in_trash
      db
        .select()
        .from(blocks)
        .where(and(eq(blocks.in_trash, 0)))
        .limit(2000)
        .then((blocks) =>
          blocks.map((block) => ({
            ...block,
            searchableContent: extractSearchableContent(block.content),
          }))
        ),

      // Todos - nemá in_trash, takže len user_id
      db
        .select()
        .from(todos)
        .where(eq(todos.user_id, userId))
        .limit(1000),

      // Events - OPRAVA: používame 0 namiesto false pre in_trash
      db
        .select()
        .from(calendarEvents)
        .where(
          and(eq(calendarEvents.user_id, userId), eq(calendarEvents.in_trash, 0))
        )
        .limit(1000),

      // Diagrams - OPRAVA: používame 0 namiesto false pre in_trash
      db
        .select()
        .from(diagrams)
        .where(and(eq(diagrams.user_id, userId), eq(diagrams.in_trash, 0)))
        .limit(1000),

      // Folders - OPRAVA: používame 0 namiesto false pre in_trash
      db
        .select()
        .from(folders)
        .where(and(eq(folders.user_id, userId), eq(folders.in_trash, 0)))
        .limit(1000),
    ]);

    console.log(`📊 Data loaded:`, {
      pages: pagesData.length,
      blocks: blocksData.length,
      todos: todosData.length,
      events: eventsData.length,
      diagrams: diagramsData.length,
      folders: foldersData.length,
    });

    // Debug: vypíš prvých pár záznamov z každého typu
    if (pagesData.length > 0) {
      console.log('📄 Sample pages:', pagesData.slice(0, 2).map(p => ({ id: p.id, title: p.title, in_trash: p.in_trash })));
    }
    if (todosData.length > 0) {
      console.log('✅ Sample todos:', todosData.slice(0, 2).map(t => ({ id: t.id, title: t.title })));
    }

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
    throw error;
  }
}

// Pomocná funkcia pre extrakciu textu z blokov
function extractSearchableContent(content: string): string {
  if (!content) return "";
  
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "string") return parsed;
    if (parsed.text) return parsed.text;
    if (parsed.content) return parsed.content;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => item.text || item.content || "").join(" ");
    }
    return JSON.stringify(parsed);
  } catch {
    return content;
  }
}

// Pomocné funkcie pre URL a metadata
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

// Funkcie pre vytvorenie výsledkov podľa typu
function createPageResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "page",
    title: item.title || "Untitled Page",
    description: item.description,
    icon: item.icon,
    url: getUrlForType("page", item),
    score,
    metadata: getMetadataForType("page", item),
  };
}

function createBlockResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "block",
    title: "Content Block",
    content: item.searchableContent?.substring(0, 200),
    url: getUrlForType("block", item),
    score,
    metadata: getMetadataForType("block", item),
  };
}

function createTodoResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "todo",
    title: item.title || "Untitled Todo",
    description: item.description,
    url: getUrlForType("todo", item),
    score,
    metadata: getMetadataForType("todo", item),
  };
}

function createEventResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "event",
    title: item.title || "Untitled Event",
    description: item.description,
    url: getUrlForType("event", item),
    score,
    metadata: getMetadataForType("event", item),
  };
}

function createDiagramResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "diagram",
    title: item.title || "Untitled Diagram",
    description: item.description,
    url: getUrlForType("diagram", item),
    score,
    metadata: getMetadataForType("diagram", item),
  };
}

function createFolderResult(item: any, score?: number): SearchResult {
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
const resultCreators: Record<
  string,
  (item: any, score?: number) => SearchResult
> = {
  pages: createPageResult,
  blocks: createBlockResult,
  todos: createTodoResult,
  events: createEventResult,
  diagrams: createDiagramResult,
  folders: createFolderResult,
};

// Optimalizovaná search funkcia pre jednotlivé typy
function searchInCollection(
  data: any[],
  query: string,
  type: string,
  limit: number,
): SearchResult[] {
  if (!data || data.length === 0) {
    console.log(`📭 No data available for type: ${type}`);
    return [];
  }

  const cacheKey = `${type}-${query}-${limit}`;

  // Skontrolovať cache
  if (fuseInstances.has(cacheKey)) {
    return fuseInstances.get(cacheKey);
  }

  try {
    const fuse = new Fuse(data, fuseOptions[type as keyof typeof fuseOptions]);
    const searchResults = fuse.search(query, { limit });
    
    const results = searchResults.map((result): SearchResult => {
      const creator = resultCreators[type];
      if (!creator) {
        return {
          id: result.item.id,
          type: "page",
          title: "Unknown Item",
          url: "/",
          score: result.score,
        };
      }

      return creator(result.item, result.score);
    });

    console.log(`🔍 Search in ${type}: found ${results.length} results for "${query}" from ${data.length} items`);

    // Cache výsledky
    fuseInstances.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error(`❌ Error searching in ${type}:`, error);
    return [];
  }
}

// Optimalizovaná search action
export const searchAction = actionClient
  .schema(searchSchema)
  .action(async ({ parsedInput: { query, limit, types } }) => {
    try {
      console.log('🔍 Search action called:', { query, limit, types });

      // Skontrolovať dĺžku query
      if (query.trim().length < 2) {
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
      console.log('👤 User ID:', userId);

      // Načítať všetky dáta naraz
      const searchData = await loadSearchData(userId);

      const results: SearchResult[] = [];
      const searchPromises: Promise<void>[] = [];

      // Paralelné vyhľadávanie vo všetkých typoch
      types.forEach((type) => {
        const data = searchData[type as keyof typeof searchData];
        if (data && data.length > 0) {
          searchPromises.push(
            Promise.resolve().then(() => {
              const typeResults = searchInCollection(
                data,
                query,
                type,
                Math.ceil(limit / types.length),
              );
              results.push(...typeResults);
            }),
          );
        } else {
          console.log(`⚠️ No data for type: ${type}`);
        }
      });

      // Počkať na všetky vyhľadávania
      await Promise.all(searchPromises);

      // Zoradiť a limitovať výsledky
      const sortedResults = results
        .filter(result => result && result.score !== undefined)
        .sort((a, b) => (a.score || 1) - (b.score || 1))
        .slice(0, limit);

      console.log(`✅ Search completed: ${sortedResults.length} results for "${query}"`);

      // Debug: vypíš prvých pár výsledkov
      if (sortedResults.length > 0) {
        console.log('📋 Sample results:', sortedResults.slice(0, 3).map(r => ({ 
          type: r.type, 
          title: r.title, 
          score: r.score 
        })));
      }

      return {
        success: true,
        data: {
          results: sortedResults,
          total: sortedResults.length,
          query,
        },
      };
    } catch (error) {
      console.error('❌ Search action error:', error);
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
  .schema(z.object({ 
    query: z.string().min(1, "Query must be at least 1 character long") 
  }))
  .action(async ({ parsedInput: { query } }) => {
    try {
      console.log('⚡ Quick search:', query);

      if (query.length < 2) {
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
        .filter(result => result && result.score !== undefined)
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
      console.error('❌ Quick search error:', error);
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
  console.log('🔄 Search cache invalidated');
}