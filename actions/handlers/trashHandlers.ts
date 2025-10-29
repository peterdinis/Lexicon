import { db } from "@/drizzle/db";
import { pages, folders, blocks } from "@/drizzle/schema";
import { getSupabaseServerClient } from "@/supabase/server";
import { eq, desc, count, and } from "drizzle-orm";

export interface TrashedPage {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  icon?: string | null;
  cover_image?: string | null;
  parent_id: string | null;
  is_folder: boolean;
  in_trash: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TrashedFolder {
  id: string;
  user_id: string;
  title: string | null;
  in_trash: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TrashItems {
  pages: TrashedPage[];
  folders: TrashedFolder[];
}

/**
 * Get all trashed items (pages and folders) for current user
 */
export async function getAllTrashedItemsHandler(): Promise<{
  data: TrashItems;
}> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);
    if (!user) throw new Error("Unauthorized");

    // Get trashed pages (where in_trash = true means IN trash)
    const trashedPages = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.user_id, user.id),
          eq(pages.in_trash, true), // true = in trash
        ),
      )
      .orderBy(desc(pages.updated_at));

    // Get trashed folders
    const trashedFolders = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.user_id, user.id),
          eq(folders.in_trash, true), // true = in trash
        ),
      )
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
 * Get all non-trashed items (for dashboard) for current user
 */
export async function getAllNonTrashedItemsHandler(): Promise<{
  data: TrashItems;
}> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);
    if (!user) throw new Error("Unauthorized");

    // Get non-trashed pages (where in_trash = false means NOT in trash)
    const nonTrashedPages = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.user_id, user.id),
          eq(pages.in_trash, false), // false = not in trash
        ),
      )
      .orderBy(desc(pages.created_at));

    // Get non-trashed folders
    const nonTrashedFolders = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.user_id, user.id),
          eq(folders.in_trash, false), // false = not in trash
        ),
      )
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
export async function moveToTrashHandler(
  table: "pages" | "folders",
  id: string,
): Promise<void> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);
    if (!user) throw new Error("Unauthorized");

    const currentTime = new Date(); // Use Date object

    if (table === "pages") {
      // Check if page exists, is not already trashed, and belongs to user
      const [page] = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.id, id),
            eq(pages.user_id, user.id),
            eq(pages.in_trash, false), // false = not in trash
          ),
        )
        .limit(1);

      if (!page) {
        throw new Error("Page not found, already in trash, or unauthorized");
      }

      // Move to trash by setting in_trash = true
      await db
        .update(pages)
        .set({
          in_trash: true, // true = in trash
          updated_at: currentTime,
        })
        .where(eq(pages.id, id));

      // Also move all blocks of this page to trash
      await db
        .update(blocks)
        .set({
          in_trash: true,
          updated_at: currentTime,
        })
        .where(eq(blocks.page_id, id));

      console.log(`Moved page ${id} to trash`);
    } else {
      // Check if folder exists, is not already trashed, and belongs to user
      const [folder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, id),
            eq(folders.user_id, user.id),
            eq(folders.in_trash, false), // false = not in trash
          ),
        )
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found, already in trash, or unauthorized");
      }

      // Move to trash by setting in_trash = true
      await db
        .update(folders)
        .set({
          in_trash: true, // true = in trash
          updated_at: currentTime,
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
export async function restoreFromTrashHandler(
  table: "pages" | "folders",
  id: string,
): Promise<void> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);
    if (!user) throw new Error("Unauthorized");

    const currentTime = new Date(); // Use Date object

    if (table === "pages") {
      // Check if page exists in trash and belongs to user
      const [page] = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.id, id),
            eq(pages.user_id, user.id),
            eq(pages.in_trash, true), // true = in trash
          ),
        )
        .limit(1);

      if (!page) {
        throw new Error("Page not found in trash or unauthorized");
      }

      // Restore by setting in_trash = false
      await db
        .update(pages)
        .set({
          in_trash: false, // false = not in trash
          updated_at: currentTime,
        })
        .where(eq(pages.id, id));

      // Also restore all blocks of this page
      await db
        .update(blocks)
        .set({
          in_trash: false,
          updated_at: currentTime,
        })
        .where(eq(blocks.page_id, id));

      console.log(`Restored page ${id} from trash`);
    } else {
      // Check if folder exists in trash and belongs to user
      const [folder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, id),
            eq(folders.user_id, user.id),
            eq(folders.in_trash, true), // true = in trash
          ),
        )
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found in trash or unauthorized");
      }

      // Restore by setting in_trash = false
      await db
        .update(folders)
        .set({
          in_trash: false, // false = not in trash
          updated_at: currentTime,
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
export async function permanentlyDeleteHandler(
  table: "pages" | "folders",
  id: string,
): Promise<void> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);
    if (!user) throw new Error("Unauthorized");

    if (table === "pages") {
      // Check if page exists in trash and belongs to user
      const [page] = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.id, id),
            eq(pages.user_id, user.id),
            eq(pages.in_trash, true), // true = in trash
          ),
        )
        .limit(1);

      if (!page) {
        throw new Error("Page not found in trash or unauthorized");
      }

      // First delete all blocks associated with this page
      await db.delete(blocks).where(eq(blocks.page_id, id));

      // Then delete the page
      await db.delete(pages).where(eq(pages.id, id));

      console.log(`Permanently deleted page ${id}`);
    } else {
      // Check if folder exists in trash and belongs to user
      const [folder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, id),
            eq(folders.user_id, user.id),
            eq(folders.in_trash, true), // true = in trash
          ),
        )
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found in trash or unauthorized");
      }

      // For folders, find and permanently delete all pages in this folder that are in trash
      const folderPages = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.parent_id, id),
            eq(pages.user_id, user.id),
            eq(pages.in_trash, true), // only delete pages that are in trash
          ),
        );

      for (const page of folderPages) {
        await permanentlyDeleteHandler("pages", page.id);
      }

      // Delete the folder
      await db.delete(folders).where(eq(folders.id, id));

      console.log(`Permanently deleted folder ${id}`);
    }
  } catch (error) {
    console.error(`Error permanently deleting ${table}:`, error);
    throw new Error(`Failed to permanently delete ${table.slice(0, -1)}`);
  }
}

/**
 * Empty entire trash for current user
 */
export async function emptyTrashHandler(): Promise<void> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);
    if (!user) throw new Error("Unauthorized");

    // First delete all blocks from trashed pages that belong to user
    const trashedPages = await db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.user_id, user.id), eq(pages.in_trash, true)));

    for (const page of trashedPages) {
      await db.delete(blocks).where(eq(blocks.page_id, page.id));
    }

    // Permanently delete all trashed pages for user
    await db
      .delete(pages)
      .where(and(eq(pages.user_id, user.id), eq(pages.in_trash, true)));

    // Permanently delete all trashed folders for user
    await db
      .delete(folders)
      .where(and(eq(folders.user_id, user.id), eq(folders.in_trash, true)));

    console.log("Emptied trash for user:", user.id);
  } catch (error) {
    console.error("Error emptying trash:", error);
    throw new Error("Failed to empty trash");
  }
}

/**
 * Get trash statistics for current user
 */
export async function getTrashStatsHandler(): Promise<{
  pagesCount: number;
  foldersCount: number;
  totalCount: number;
}> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);
    if (!user) throw new Error("Unauthorized");

    // Get pages count in trash for user
    const [pagesResult] = await db
      .select({ count: count() })
      .from(pages)
      .where(
        and(
          eq(pages.user_id, user.id),
          eq(pages.in_trash, true), // true = in trash
        ),
      );

    // Get folders count in trash for user
    const [foldersResult] = await db
      .select({ count: count() })
      .from(folders)
      .where(
        and(
          eq(folders.user_id, user.id),
          eq(folders.in_trash, true), // true = in trash
        ),
      );

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
 * Get folder detail with pages and subfolders for current user
 */
export async function getFolderDetailHandler(folderId: string): Promise<{
  folder: TrashedFolder;
  pages: TrashedPage[];
  subfolders: TrashedFolder[];
}> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(userError.message);
    if (!user) throw new Error("Unauthorized");

    // Get folder info (not in trash)
    const [folder] = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.id, folderId),
          eq(folders.user_id, user.id),
          eq(folders.in_trash, false), // false = not in trash
        ),
      )
      .limit(1);

    if (!folder) {
      throw new Error("Folder not found or unauthorized");
    }

    // Get pages in this folder (not in trash)
    const folderPages = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.parent_id, folderId),
          eq(pages.user_id, user.id),
          eq(pages.in_trash, false), // false = not in trash
          eq(pages.is_folder, false), // false = not a folder (actual page)
        ),
      )
      .orderBy(desc(pages.updated_at));

    // Get subfolders (folders with this folder as parent - if your schema supports it)
    // Note: Your current folders schema doesn't have parent_id, so this returns all user folders
    const subfolders = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.user_id, user.id),
          eq(folders.in_trash, false), // false = not in trash
        ),
      )
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
