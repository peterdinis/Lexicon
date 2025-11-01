import { db } from "@/drizzle/db";
import { pages, folders, blocks } from "@/drizzle/schema";
import { getAuthenticatedUser } from "@/supabase/get-user-id";
import { TrashedFolder, TrashedPage, TrashItems } from "@/types/trashTypes";
import { eq, desc, count, and } from "drizzle-orm";

export async function getAllTrashedItemsHandler(): Promise<{
  data: TrashItems;
}> {
  try {
    const { user } = await getAuthenticatedUser();
    const trashedPages = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.user_id, user.id),
          eq(pages.in_trash, true),
        ),
      )
      .orderBy(desc(pages.updated_at));

    const trashedFolders = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.user_id, user.id),
          eq(folders.in_trash, true),
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
    throw new Error("Failed to load trashed items");
  }
}

export async function getAllNonTrashedItemsHandler(): Promise<{
  data: TrashItems;
}> {
  try {
    const { user } = await getAuthenticatedUser();

    const nonTrashedPages = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.user_id, user.id),
          eq(pages.in_trash, false),
        ),
      )
      .orderBy(desc(pages.created_at));

    const nonTrashedFolders = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.user_id, user.id),
          eq(folders.in_trash, false),
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
    throw new Error("Failed to load items");
  }
}

export async function moveToTrashHandler(
  table: "pages" | "folders",
  id: string,
): Promise<void> {
  try {
    const { user } = await getAuthenticatedUser();

    const currentTime = new Date();

    if (table === "pages") {
      const [page] = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.id, id),
            eq(pages.user_id, user.id),
            eq(pages.in_trash, false),
          ),
        )
        .limit(1);

      if (!page) {
        throw new Error("Page not found, already in trash, or unauthorized");
      }

      await db
        .update(pages)
        .set({
          in_trash: true,
          updated_at: currentTime,
        })
        .where(eq(pages.id, id));

      await db
        .update(blocks)
        .set({
          in_trash: true,
          updated_at: currentTime,
        })
        .where(eq(blocks.page_id, id));

      console.log(`Moved page ${id} to trash`);
    } else {
      const [folder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, id),
            eq(folders.user_id, user.id),
            eq(folders.in_trash, false),
          ),
        )
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found, already in trash, or unauthorized");
      }

      await db
        .update(folders)
        .set({
          in_trash: true,
          updated_at: currentTime,
        })
        .where(eq(folders.id, id));
    }
  } catch (error) {
    throw new Error(`Failed to move ${table.slice(0, -1)} to trash`);
  }
}

export async function restoreFromTrashHandler(
  table: "pages" | "folders",
  id: string,
): Promise<void> {
  try {
    const { user } = await getAuthenticatedUser();

    const currentTime = new Date();

    if (table === "pages") {
      const [page] = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.id, id),
            eq(pages.user_id, user.id),
            eq(pages.in_trash, true),
          ),
        )
        .limit(1);

      if (!page) {
        throw new Error("Page not found in trash or unauthorized");
      }
      await db
        .update(pages)
        .set({
          in_trash: false,
          updated_at: currentTime,
        })
        .where(eq(pages.id, id));

      await db
        .update(blocks)
        .set({
          in_trash: false,
          updated_at: currentTime,
        })
        .where(eq(blocks.page_id, id));
    } else {
      const [folder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, id),
            eq(folders.user_id, user.id),
            eq(folders.in_trash, true),
          ),
        )
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found in trash or unauthorized");
      }

      await db
        .update(folders)
        .set({
          in_trash: false,
          updated_at: currentTime,
        })
        .where(eq(folders.id, id));
    }
  } catch (error) {
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
    const { user } = await getAuthenticatedUser();

    if (table === "pages") {
      const [page] = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.id, id),
            eq(pages.user_id, user.id),
            eq(pages.in_trash, true),
          ),
        )
        .limit(1);

      if (!page) {
        throw new Error("Page not found in trash or unauthorized");
      }

      await db.delete(blocks).where(eq(blocks.page_id, id));

      await db.delete(pages).where(eq(pages.id, id));
    } else {
      const [folder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, id),
            eq(folders.user_id, user.id),
            eq(folders.in_trash, true),
          ),
        )
        .limit(1);

      if (!folder) {
        throw new Error("Folder not found in trash or unauthorized");
      }

      const folderPages = await db
        .select()
        .from(pages)
        .where(
          and(
            eq(pages.parent_id, id),
            eq(pages.user_id, user.id),
            eq(pages.in_trash, true),
          ),
        );

      for (const page of folderPages) {
        await permanentlyDeleteHandler("pages", page.id);
      }

      await db.delete(folders).where(eq(folders.id, id));
    }
  } catch (error) {
    throw new Error(`Failed to permanently delete ${table.slice(0, -1)}`);
  }
}

export async function emptyTrashHandler(): Promise<void> {
  try {
    const { user } = await getAuthenticatedUser();

    const trashedPages = await db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.user_id, user.id), eq(pages.in_trash, true)));

    for (const page of trashedPages) {
      await db.delete(blocks).where(eq(blocks.page_id, page.id));
    }

    await db
      .delete(pages)
      .where(and(eq(pages.user_id, user.id), eq(pages.in_trash, true)));

    await db
      .delete(folders)
      .where(and(eq(folders.user_id, user.id), eq(folders.in_trash, true)));
  } catch (error) {
    console.error("Error emptying trash:", error);
    throw new Error("Failed to empty trash");
  }
}

export async function getTrashStatsHandler(): Promise<{
  pagesCount: number;
  foldersCount: number;
  totalCount: number;
}> {
  try {
    const { user } = await getAuthenticatedUser();

    const [pagesResult] = await db
      .select({ count: count() })
      .from(pages)
      .where(
        and(
          eq(pages.user_id, user.id),
          eq(pages.in_trash, true)
        ),
      );

    const [foldersResult] = await db
      .select({ count: count() })
      .from(folders)
      .where(
        and(
          eq(folders.user_id, user.id),
          eq(folders.in_trash, true),
        ),
      );

    return {
      pagesCount: pagesResult?.count || 0,
      foldersCount: foldersResult?.count || 0,
      totalCount: (pagesResult?.count || 0) + (foldersResult?.count || 0),
    };
  } catch (error) {
    throw new Error("Failed to get trash statistics");
  }
}

export async function getFolderDetailHandler(folderId: string): Promise<{
  folder: TrashedFolder;
  pages: TrashedPage[];
  subfolders: TrashedFolder[];
}> {
  try {
    const { user } = await getAuthenticatedUser();

    const [folder] = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.id, folderId),
          eq(folders.user_id, user.id),
          eq(folders.in_trash, false),
        ),
      )
      .limit(1);

    if (!folder) {
      throw new Error("Folder not found or unauthorized");
    }

    const folderPages = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.parent_id, folderId),
          eq(pages.user_id, user.id),
          eq(pages.in_trash, false),
          eq(pages.is_folder, false),
        ),
      )
      .orderBy(desc(pages.updated_at));

    const subfolders = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.user_id, user.id),
          eq(folders.in_trash, false),
        ),
      )
      .orderBy(desc(folders.updated_at));

    return {
      folder: folder as TrashedFolder,
      pages: folderPages as TrashedPage[],
      subfolders: subfolders as TrashedFolder[],
    };
  } catch (error) {
    throw new Error("Failed to load folder details");
  }
}
