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
import { eq, and} from "drizzle-orm";
import { searchSchema } from "./schemas/searchSchemas";
import { fetchUser } from "./authActions";

// Types for search results
export type SearchResult = {
  id: string;
  type: "page" | "block" | "todo" | "event" | "diagram" | "folder" | "notification";
  title: string;
  description?: string;
  content?: string;
  icon?: string;
  url: string;
  score?: number;
  metadata?: Record<string, any>;
};

// Fuse.js options for different types
const fuseOptions = {
  pages: {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "description", weight: 0.4 }
    ],
    threshold: 0.3,
    includeScore: true
  },
  blocks: {
    keys: [
      { name: "content", weight: 1.0 }
    ],
    threshold: 0.4,
    includeScore: true
  },
  todos: {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "description", weight: 0.3 }
    ],
    threshold: 0.3,
    includeScore: true
  },
  events: {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "description", weight: 0.3 }
    ],
    threshold: 0.3,
    includeScore: true
  },
  diagrams: {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "description", weight: 0.3 }
    ],
    threshold: 0.3,
    includeScore: true
  },
  folders: {
    keys: [
      { name: "title", weight: 1.0 }
    ],
    threshold: 0.3,
    includeScore: true
  }
};

// Search action
export const searchAction = actionClient
  .inputSchema(searchSchema)
  .action(async ({ parsedInput: { query, limit, types } }) => {
    try {
      const results: SearchResult[] = [];
      const user = await fetchUser();
      const userId = user.id;

      // Search Pages
      if (types.includes("pages")) {
        const pagesData = await db
          .select()
          .from(pages)
          .where(
            and(
              eq(pages.user_id, userId),
              eq(pages.in_trash, 0)
            )
          )
          .limit(50);

        const fuse = new Fuse(pagesData, fuseOptions.pages);
        const pageResults = fuse.search(query).slice(0, limit);

        pageResults.forEach((result) => {
          results.push({
            id: result.item.id,
            type: "page",
            title: result.item.title,
            description: result.item.description,
            icon: result.item.icon as unknown as string,
            url: `/page/${result.item.id}`,
            score: result.score,
            metadata: {
              is_folder: result.item.is_folder,
              created_at: result.item.created_at
            }
          });
        });
      }

      // Search Blocks
      if (types.includes("blocks")) {
        const blocksData = await db
          .select()
          .from(blocks)
          .where(eq(blocks.in_trash, 0))
          .limit(100);

        // Parse block content for search
        const searchableBlocks = blocksData.map(block => ({
          ...block,
          searchableContent: typeof block.content === 'string' 
            ? JSON.parse(block.content)?.text || JSON.parse(block.content)?.content || ''
            : ''
        }));

        const fuse = new Fuse(searchableBlocks, fuseOptions.blocks);
        const blockResults = fuse.search(query).slice(0, limit);

        blockResults.forEach((result) => {
          results.push({
            id: result.item.id,
            type: "block",
            title: `Block in page`,
            content: result.item.searchableContent,
            url: `/page/${result.item.page_id}#block-${result.item.id}`,
            score: result.score,
            metadata: {
              type: result.item.type,
              position: result.item.position
            }
          });
        });
      }

      // Search Todos
      if (types.includes("todos")) {
        const todosData = await db
          .select()
          .from(todos)
          .where(eq(todos.user_id, userId))
          .limit(50);

        const fuse = new Fuse(todosData, fuseOptions.todos);
        const todoResults = fuse.search(query).slice(0, limit);

        todoResults.forEach((result) => {
          results.push({
            id: result.item.id,
            type: "todo",
            title: result.item.title,
            description: result.item.description as unknown as string,
            url: `/todos#todo-${result.item.id}`,
            score: result.score,
            metadata: {
              completed: result.item.completed,
              priority: result.item.priority,
              due_date: result.item.due_date
            }
          });
        });
      }

      // Search Calendar Events
      if (types.includes("events")) {
        const eventsData = await db
          .select()
          .from(calendarEvents)
          .where(
            and(
              eq(calendarEvents.user_id, userId),
              eq(calendarEvents.in_trash, 0)
            )
          )
          .limit(50);

        const fuse = new Fuse(eventsData, fuseOptions.events);
        const eventResults = fuse.search(query).slice(0, limit);

        eventResults.forEach((result) => {
          results.push({
            id: result.item.id,
            type: "event",
            title: result.item.title,
            description: result.item.description as unknown as string,
            url: `/calendar#event-${result.item.id}`,
            score: result.score,
            metadata: {
              start_time: result.item.start_time,
              end_time: result.item.end_time,
              all_day: result.item.all_day
            }
          });
        });
      }

      // Search Diagrams
      if (types.includes("diagrams")) {
        const diagramsData = await db
          .select()
          .from(diagrams)
          .where(
            and(
              eq(diagrams.user_id, userId),
              eq(diagrams.in_trash, 0)
            )
          )
          .limit(50);

        const fuse = new Fuse(diagramsData, fuseOptions.diagrams);
        const diagramResults = fuse.search(query).slice(0, limit);

        diagramResults.forEach((result) => {
          results.push({
            id: result.item.id,
            type: "diagram",
            title: result.item.title,
            description: result.item.description as unknown as string,
            url: `/diagrams/${result.item.id}`,
            score: result.score,
            metadata: {
              created_at: result.item.created_at
            }
          });
        });
      }

      // Search Folders
      if (types.includes("folders")) {
        const foldersData = await db
          .select()
          .from(folders)
          .where(
            and(
              eq(folders.user_id, userId),
              eq(folders.in_trash, 0)
            )
          )
          .limit(50);

        const fuse = new Fuse(foldersData, fuseOptions.folders);
        const folderResults = fuse.search(query).slice(0, limit);

        folderResults.forEach((result) => {
          results.push({
            id: result.item.id,
            type: "folder",
            title: result.item.title,
            url: `/folder/${result.item.id}`,
            score: result.score,
            metadata: {
              created_at: result.item.created_at
            }
          });
        });
      }

      // Sort by relevance score
      const sortedResults = results
        .sort((a, b) => (a.score || 0) - (b.score || 0))
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

// Quick search action (simplified version)
export const quickSearchAction = actionClient
  .inputSchema(z.object({ query: z.string().min(1) }))
  .action(async ({ parsedInput: { query } }) => {
    try {
      const result = await searchAction({ 
        query, 
        limit: 5, 
        types: ["pages", "todos", "events"] 
      });
      
      return result;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  });