"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Trash2, FileText, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  getAllTrashedItemsAction,
  restoreFromTrashAction,
  permanentlyDeleteAction,
} from "@/actions/trashActions";

interface Page {
  id: string;
  title?: string;
  description?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

interface FolderType {
  id: string;
  title?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

interface TrashWrapperProps {}

export function TrashWrapper({}: TrashWrapperProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    async function fetchTrash() {
      try {
        const items = await getAllTrashedItemsAction();
        setPages(
          items.data && Array.isArray(items.data.pages) ? items.data.pages : [],
        );
        setFolders(
          items.data && Array.isArray(items.data.folders)
            ? items.data.folders
            : [],
        );
      } catch (err) {
        console.error("Error loading trash:", err);
      }
    }
    fetchTrash();
  }, []);

  const restoreItem = async (id: string, table: "pages" | "folders") => {
    setLoading((prev) => ({ ...prev, [`restore-${id}`]: true }));
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("table", table);

      const result = await restoreFromTrashAction(formData);

      if (!result.success) throw new Error(result.error);

      if (table === "pages") {
        setPages(pages.filter((p) => p.id !== id));
      } else {
        setFolders(folders.filter((f) => f.id !== id));
      }
      router.refresh();
    } catch (error) {
      console.error("Error restoring item:", error);
      alert("Failed to restore item");
    } finally {
      setLoading((prev) => ({ ...prev, [`restore-${id}`]: false }));
    }
  };

  const permanentlyDelete = async (id: string, table: "pages" | "folders") => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this item? This action cannot be undone.",
      )
    )
      return;

    setLoading((prev) => ({ ...prev, [`delete-${id}`]: true }));
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("table", table);

      const result = await permanentlyDeleteAction(formData);

      if (!result.success) throw new Error(result.error);

      if (table === "pages") {
        setPages(pages.filter((p) => p.id !== id));
      } else {
        setFolders(folders.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    } finally {
      setLoading((prev) => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  const isEmpty = pages.length === 0 && folders.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-2">
            Trash
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Restore or permanently delete items from trash
          </p>
        </div>
        {!isEmpty && (
          <div className="text-sm text-neutral-500">
            {pages.length + folders.length} item
            {pages.length + folders.length !== 1 ? "s" : ""} in trash
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Trash2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground">
            Items you move to trash will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pages Section */}
          {pages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Pages ({pages.length})
              </h3>
              <div className="space-y-3">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="group flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {page.title || "Untitled Page"}
                      </h3>
                      {page.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {page.description}
                        </p>
                      )}
                      {page.deleted_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Deleted{" "}
                          {format(
                            new Date(page.deleted_at),
                            "MMM d, yyyy 'at' h:mm a",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreItem(page.id, "pages")}
                        disabled={loading[`restore-${page.id}`]}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {loading[`restore-${page.id}`]
                          ? "Restoring..."
                          : "Restore"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => permanentlyDelete(page.id, "pages")}
                        disabled={loading[`delete-${page.id}`]}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {loading[`delete-${page.id}`]
                          ? "Deleting..."
                          : "Delete Forever"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folders Section */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Folders ({folders.length})
              </h3>
              <div className="space-y-3">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="group flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <Folder className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {folder.title || "Unnamed Folder"}
                      </h3>
                      {folder.deleted_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Deleted{" "}
                          {format(
                            new Date(folder.deleted_at),
                            "MMM d, yyyy 'at' h:mm a",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreItem(folder.id, "folders")}
                        disabled={loading[`restore-${folder.id}`]}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {loading[`restore-${folder.id}`]
                          ? "Restoring..."
                          : "Restore"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => permanentlyDelete(folder.id, "folders")}
                        disabled={loading[`delete-${folder.id}`]}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {loading[`delete-${folder.id}`]
                          ? "Deleting..."
                          : "Delete Forever"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
