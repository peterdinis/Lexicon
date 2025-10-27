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
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true
  },
  blocks: {
    keys: ["searchableContent"],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 3,
    useExtendedSearch: true
  },
  todos: {
    keys: ["title", "description"],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true
  },
  events: {
    keys: ["title", "description"],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true
  },
  diagrams: {
    keys: ["title", "description"],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true
  },
  folders: {
    keys: ["title"],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true
  }
};

// Funkcia pre načítanie a cache dát
async function loadSearchData(userId: string) {
  const now = Date.now();
  
  // Vrátiť cache ak je ešte platný
  if (cachedSearchData && (now - lastCacheUpdate) < CACHE_TTL) {
    return cachedSearchData;
  }

  // Paralelné načítanie všetkých dát
  const [
    pagesData,
    blocksData,
    todosData,
    eventsData,
    diagramsData,
    foldersData
  ] = await Promise.all([
    // Pages
    db.select().from(pages)
      .where(and(eq(pages.user_id, userId), eq(pages.in_trash, 0)))
      .limit(100),
    
    // Blocks
    db.select().from(blocks)
      .where(eq(blocks.in_trash, 0))
      .limit(200)
      .then(blocks => blocks.map(block => ({
        ...block,
        searchableContent: extractSearchableContent(block.content)
      }))),
    
    // Todos
    db.select().from(todos)
      .where(eq(todos.user_id, userId))
      .limit(100),
    
    // Events
    db.select().from(calendarEvents)
      .where(and(eq(calendarEvents.user_id, userId), eq(calendarEvents.in_trash, 0)))
      .limit(100),
    
    // Diagrams
    db.select().from(diagrams)
      .where(and(eq(diagrams.user_id, userId), eq(diagrams.in_trash, 0)))
      .limit(100),
    
    // Folders
    db.select().from(folders)
      .where(and(eq(folders.user_id, userId), eq(folders.in_trash, 0)))
      .limit(100)
  ]);

  cachedSearchData = {
    pages: pagesData,
    blocks: blocksData,
    todos: todosData,
    events: eventsData,
    diagrams: diagramsData,
    folders: foldersData
  };
  
  lastCacheUpdate = now;
  
  return cachedSearchData;
}

// Pomocná funkcia pre extrakciu textu z blokov
function extractSearchableContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === 'string') return parsed;
    if (parsed.text) return parsed.text;
    if (parsed.content) return parsed.content;
    if (Array.isArray(parsed)) {
      return parsed.map(item => item.text || item.content || '').join(' ');
    }
    return '';
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
    folder: `/folder/${item.id}`
  };
  return urls[type as keyof typeof urls];
}

function getMetadataForType(type: string, item: any): Record<string, any> {
  const metadata: Record<string, any> = {
    created_at: item.created_at
  };

  switch (type) {
    case 'pages':
      metadata.is_folder = item.is_folder;
      break;
    case 'blocks':
      metadata.type = item.type;
      metadata.position = item.position;
      break;
    case 'todos':
      metadata.completed = item.completed;
      metadata.priority = item.priority;
      metadata.due_date = item.due_date;
      break;
    case 'events':
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
    title: item.title || "Untitled",
    description: item.description,
    icon: item.icon,
    url: getUrlForType("page", item),
    score,
    metadata: getMetadataForType("page", item)
  };
}

function createBlockResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "block",
    title: "Content block",
    content: item.searchableContent,
    url: getUrlForType("block", item),
    score,
    metadata: getMetadataForType("block", item)
  };
}

function createTodoResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "todo",
    title: item.title || "Untitled todo",
    description: item.description,
    url: getUrlForType("todo", item),
    score,
    metadata: getMetadataForType("todo", item)
  };
}

function createEventResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "event",
    title: item.title || "Untitled event",
    description: item.description,
    url: getUrlForType("event", item),
    score,
    metadata: getMetadataForType("event", item)
  };
}

function createDiagramResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "diagram",
    title: item.title || "Untitled diagram",
    description: item.description,
    url: getUrlForType("diagram", item),
    score,
    metadata: getMetadataForType("diagram", item)
  };
}

function createFolderResult(item: any, score?: number): SearchResult {
  return {
    id: item.id,
    type: "folder",
    title: item.title || "Untitled folder",
    url: getUrlForType("folder", item),
    score,
    metadata: getMetadataForType("folder", item)
  };
}

// Mapovanie typov na funkcie pre vytvorenie výsledkov
const resultCreators: Record<string, (item: any, score?: number) => SearchResult> = {
  pages: createPageResult,
  blocks: createBlockResult,
  todos: createTodoResult,
  events: createEventResult,
  diagrams: createDiagramResult,
  folders: createFolderResult
};

// Optimalizovaná search funkcia pre jednotlivé typy
function searchInCollection(
  data: any[], 
  query: string, 
  type: string, 
  limit: number
): SearchResult[] {
  const cacheKey = `${type}-${query}-${limit}`;
  
  // Skontrolovať cache
  if (fuseInstances.has(cacheKey)) {
    return fuseInstances.get(cacheKey);
  }

  const fuse = new Fuse(data, fuseOptions[type as keyof typeof fuseOptions]);
  const results = fuse.search(query, { limit }).map((result): SearchResult => {
    const creator = resultCreators[type];
    if (!creator) {
      // Fallback pre neznáme typy
      return {
        id: result.item.id,
        type: "page" as const,
        title: "Unknown item",
        url: "/",
        score: result.score
      };
    }
    
    return creator(result.item, result.score);
  });

  // Cache výsledky
  fuseInstances.set(cacheKey, results);
  return results;
}

// Optimalizovaná search action
export const searchAction = actionClient
  .inputSchema(searchSchema)
  .action(async ({ parsedInput: { query, limit, types } }) => {
    try {
      // Skontrolovať dĺžku query
      if (query.trim().length < 2) {
        return {
          success: true,
          data: {
            results: [],
            total: 0,
            query
          }
        };
      }

      const user = await fetchUser();
      const userId = user.id;

      // Načítať všetky dáta naraz
      const searchData = await loadSearchData(userId);
      
      const results: SearchResult[] = [];
      const searchPromises: Promise<void>[] = [];

      // Paralelné vyhľadávanie vo všetkých typoch
      types.forEach(type => {
        if (searchData[type as keyof typeof searchData]?.length > 0) {
          searchPromises.push(
            Promise.resolve().then(() => {
              const typeResults = searchInCollection(
                searchData[type as keyof typeof searchData],
                query,
                type,
                Math.ceil(limit / types.length) // Rozdeliť limit medzi typy
              );
              results.push(...typeResults);
            })
          );
        }
      });

      // Počkať na všetky vyhľadávania
      await Promise.all(searchPromises);

      // Zoradiť a limitovať výsledky
      const sortedResults = results
        .sort((a, b) => (a.score || 1) - (b.score || 1))
        .slice(0, limit);

      return {
        success: true,
        data: {
          results: sortedResults,
          total: sortedResults.length,
          query
        }
      };

    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// Ešte rýchlejšia quick search action
export const quickSearchAction = actionClient
  .inputSchema(z.object({ query: z.string().min(1) }))
  .action(async ({ parsedInput: { query } }) => {
    try {
      if (query.length < 2) {
        return {
          success: true,
          data: {
            results: [],
            total: 0,
            query
          }
        };
      }

      // Použiť cache ak je dostupný
      const user = await fetchUser();
      const searchData = await loadSearchData(user.id);

      // Vyhľadávať len v najdôležitejších typoch
      const quickTypes = ["pages", "todos"] as const;
      const results: SearchResult[] = [];

      quickTypes.forEach(type => {
        if (searchData[type]?.length > 0) {
          const typeResults = searchInCollection(
            searchData[type],
            query,
            type,
            3 // Menej výsledkov pre quick search
          );
          results.push(...typeResults);
        }
      });

      const sortedResults = results
        .sort((a, b) => (a.score || 1) - (b.score || 1))
        .slice(0, 5);

      return {
        success: true,
        data: {
          results: sortedResults,
          total: sortedResults.length,
          query
        }
      };

    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });

// Funkcia pre invalidáciu cache
export async function invalidateSearchCache() {
  cachedSearchData = null;
  fuseInstances.clear();
  lastCacheUpdate = 0;
}