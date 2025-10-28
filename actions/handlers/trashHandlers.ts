import { db } from "@/drizzle/db";
import { pages, folders, blocks } from "@/drizzle/schema";
import { eq, desc, count, and } from "drizzle-orm";

export interface TrashedPage {
  id: string;
  title: string | null;
  description: string | null;
  parent_id: string | null;
  is_folder: number;
  in_trash: number;
  created_at: string;
  updated_at: string;
}

export interface TrashedFolder {
  id: string;
  title: string | null;
  in_trash: number;
  created_at: string;
  updated_at: string;
}

export interface TrashItems {
  pages: TrashedPage[];
  folders: TrashedFolder[];
}

/**
 * Get all trashed items (pages and folders)
 */
export async function getAllTrashedItemsHandler(): Promise<{ data: TrashItems }> {
  try {
    // Get trashed pages (where in_trash = 0 means NOT in trash, 1 means IN trash)
    const trashedPages = await db
      .select()
      .from(pages)
      .where(eq(pages.in_trash, 0)) // 0 = in trash
      .orderBy(desc(pages.updated_at));

    // Get trashed folders
    const trashedFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.in_trash, 0)) // 0 = in trash
      .orderBy(desc(folders.updated_at));

    return {
      data: {
        pages: trashedPages as TrashedPage[],
        folders: trashedFolders as TrashedFolder[],
      },
    };
  } catch (error) {
    console.error("Error getting trashed items:", error);
    throw new Error("Failed to load trashed items");
  }
}

/**
 * Get all non-trashed items (for dashboard)
 */
export async function getAllNonTrashedItemsHandler(): Promise<{ data: TrashItems }> {
  try {
    // Get non-trashed pages (where in_trash = 1 means NOT in trash)
    const nonTrashedPages = await db
      .select()
      .from(pages)
      .where(eq(pages.in_trash, 1)) // 1 = not in trash
      .orderBy(desc(pages.created_at));

    // Get non-trashed folders
    const nonTrashedFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.in_trash, 1)) // 1 = not in trash
      .orderBy(desc(folders.created_at));

    return {
      data: {
        pages: nonTrashedPages as TrashedPage[],
        folders: nonTrashedFolders as TrashedFolder[],
      },
    };
  } catch (error) {
    console.error("Error getting non-trashed items:", error);
    throw new Error("Failed to load items");
  }
}

/**
 * Move item to trash
 */
export async function moveToTrashHandler(table: "pages" | "folders", id: string): Promise<void> {
  try {
    const currentTime = new Date().toISOString();

    if (table === "pages") {
      // Check if page exists and is not already trashed
      const [page] = await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, id), eq(pages.in_trash, 1))) // 1 = not in trash
        .limit(1);

      if (!page) {
        throw new Error("Page not found or already in trash");
      }

      // Move to trash by setting in_trash = 0
      await db
        .update(pages)
        .set({ 
          in_trash: 0, // 0 = in trash
          updated_at: currentTime
        })
        .where(eq(pages.id, id));

      // Also move all blocks of this page to trash
      await db
        .update(blocks)
        .set({ 
          in_trash: 0,
          updated_at: currentTime
        })
        .where(eq(blocks.page_id, id));

      console.log(`Moved page ${id} to trash`);
    } else {
      // Check if folder exists and is not already trashed
      const [folder] = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, id), eq(folders.in_trash, 1))) // 1 = not in trash
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found or already in trash");
      }

      // Move to trash by setting in_trash = 0
      await db
        .update(folders)
        .set({ 
          in_trash: 0, // 0 = in trash
          updated_at: currentTime
        })
        .where(eq(folders.id, id));

      console.log(`Moved folder ${id} to trash`);
    }
  } catch (error) {
    console.error(`Error moving ${table} to trash:`, error);
    throw new Error(`Failed to move ${table.slice(0, -1)} to trash`);
  }
}

/**
 * Restore item from trash
 */
export async function restoreFromTrashHandler(table: "pages" | "folders", id: string): Promise<void> {
  try {
    const currentTime = new Date().toISOString();

    if (table === "pages") {
      // Check if page exists in trash
      const [page] = await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, id), eq(pages.in_trash, 0))) // 0 = in trash
        .limit(1);

      if (!page) {
        throw new Error("Page not found in trash");
      }

      // Restore by setting in_trash = 1
      await db
        .update(pages)
        .set({ 
          in_trash: 1, // 1 = not in trash
          updated_at: currentTime
        })
        .where(eq(pages.id, id));

      // Also restore all blocks of this page
      await db
        .update(blocks)
        .set({ 
          in_trash: 1,
          updated_at: currentTime
        })
        .where(eq(blocks.page_id, id));

      console.log(`Restored page ${id} from trash`);
    } else {
      // Check if folder exists in trash
      const [folder] = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, id), eq(folders.in_trash, 0))) // 0 = in trash
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found in trash");
      }

      // Restore by setting in_trash = 1
      await db
        .update(folders)
        .set({ 
          in_trash: 1, // 1 = not in trash
          updated_at: currentTime
        })
        .where(eq(folders.id, id));

      console.log(`Restored folder ${id} from trash`);
    }
  } catch (error) {
    console.error(`Error restoring ${table} from trash:`, error);
    throw new Error(`Failed to restore ${table.slice(0, -1)} from trash`);
  }
}

/**
 * Permanently delete item from trash
 */
export async function permanentlyDeleteHandler(table: "pages" | "folders", id: string): Promise<void> {
  try {
    if (table === "pages") {
      // Check if page exists in trash
      const [page] = await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, id), eq(pages.in_trash, 0))) // 0 = in trash
        .limit(1);

      if (!page) {
        throw new Error("Page not found in trash");
      }

      // First delete all blocks associated with this page
      await db
        .delete(blocks)
        .where(eq(blocks.page_id, id));

      // Then delete the page
      await db
        .delete(pages)
        .where(eq(pages.id, id));

      console.log(`Permanently deleted page ${id}`);
    } else {
      // Check if folder exists in trash
      const [folder] = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, id), eq(folders.in_trash, 0))) // 0 = in trash
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found in trash");
      }

      // For folders, find and permanently delete all pages in this folder
      const folderPages = await db
        .select()
        .from(pages)
        .where(and(eq(pages.parent_id, id), eq(pages.in_trash, 1))); // pages not in trash

      for (const page of folderPages) {
        await permanentlyDeleteHandler("pages", page.id);
      }

      // Delete the folder
      await db
        .delete(folders)
        .where(eq(folders.id, id));

      console.log(`Permanently deleted folder ${id}`);
    }
  } catch (error) {
    console.error(`Error permanently deleting ${table}:`, error);
    throw new Error(`Failed to permanently delete ${table.slice(0, -1)}`);
  }
}

/**
 * Empty entire trash
 */
export async function emptyTrashHandler(): Promise<void> {
  try {
    // First delete all blocks from trashed pages
    const trashedPages = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.in_trash, 0));

    for (const page of trashedPages) {
      await db
        .delete(blocks)
        .where(eq(blocks.page_id, page.id));
    }

    // Permanently delete all trashed pages
    await db
      .delete(pages)
      .where(eq(pages.in_trash, 0));

    // Permanently delete all trashed folders
    await db
      .delete(folders)
      .where(eq(folders.in_trash, 0));

    console.log("Emptied trash");
  } catch (error) {
    console.error("Error emptying trash:", error);
    throw new Error("Failed to empty trash");
  }
}

/**
 * Get trash statistics
 */
export async function getTrashStatsHandler(): Promise<{ 
  pagesCount: number; 
  foldersCount: number;
  totalCount: number;
}> {
  try {
    // Get pages count in trash
    const [pagesResult] = await db
      .select({ count: count() })
      .from(pages)
      .where(eq(pages.in_trash, 0)); // 0 = in trash

    // Get folders count in trash
    const [foldersResult] = await db
      .select({ count: count() })
      .from(folders)
      .where(eq(folders.in_trash, 0)); // 0 = in trash

    return {
      pagesCount: pagesResult?.count || 0,
      foldersCount: foldersResult?.count || 0,
      totalCount: (pagesResult?.count || 0) + (foldersResult?.count || 0),
    };
  } catch (error) {
    console.error("Error getting trash stats:", error);
    throw new Error("Failed to get trash statistics");
  }
}

/**
 * Get folder detail with pages and subfolders
 */
export async function getFolderDetailHandler(folderId: string): Promise<{
  folder: TrashedFolder;
  pages: TrashedPage[];
  subfolders: TrashedFolder[];
}> {
  try {
    // Get folder info
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.in_trash, 1))) // 1 = not in trash
      .limit(1);

    if (!folder) {
      throw new Error("Folder not found");
    }

    // Get pages in this folder (not in trash)
    const folderPages = await db
      .select()
      .from(pages)
      .where(and(
        eq(pages.parent_id, folderId),
        eq(pages.in_trash, 1), // 1 = not in trash
        eq(pages.is_folder, 0) // 0 = not a folder (actual page)
      ))
      .orderBy(desc(pages.updated_at));

    // Get subfolders in this folder (not in trash)
    const subfolders = await db
      .select()
      .from(folders)
      .where(and(
        // If your folders have parent_id structure, adjust here
        // Currently folders don't have parent_id in your schema
        eq(folders.in_trash, 1) // 1 = not in trash
      ))
      .orderBy(desc(folders.updated_at));

    return {
      folder: folder as TrashedFolder,
      pages: folderPages as TrashedPage[],
      subfolders: subfolders as TrashedFolder[],
    };
  } catch (error) {
    console.error("Error getting folder detail:", error);
    throw new Error("Failed to load folder details");
  }
}