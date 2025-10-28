"use client";

import { useState } from "react";
import {
  File,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
  Move,
} from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updatePageAction,
  deletePageAction,
  movePageAction,
} from "@/actions/pagesActions";
import {
  updateFolderAction,
  deleteFolderAction,
} from "@/actions/folderActions";

interface Page {
  id: string;
  title?: string;
  description?: string;
  parent_id?: string | null;
}

interface FolderType {
  id: string;
  title?: string;
  parent_id?: string | null;
}

interface DashboardClientProps {
  pages: Page[];
  folders: FolderType[];
  itemsPerPage?: number;
}

export default function DashboardClient({
  pages,
  folders,
  itemsPerPage = 6,
}: DashboardClientProps) {
  const [pagesPage, setPagesPage] = useState(1);
  const [foldersPage, setFoldersPage] = useState(1);

  // State pre dialógy
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "page" | "folder";
    id: string;
    title: string;
  } | null>(null);

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    type: "page" | "folder";
    id: string;
    title: string;
    description?: string;
  } | null>(null);

  const [moveDialog, setMoveDialog] = useState<{
    open: boolean;
    pageId: string;
    pageTitle: string;
    currentFolderId?: string | null;
  } | null>(null);

  // State pre formuláre
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pagesStart = (pagesPage - 1) * itemsPerPage;
  const foldersStart = (foldersPage - 1) * itemsPerPage;

  const pagesToShow = pages.slice(pagesStart, pagesStart + itemsPerPage);
  const foldersToShow = folders.slice(
    foldersStart,
    foldersStart + itemsPerPage,
  );

  const totalPagesPages = Math.ceil(pages.length / itemsPerPage);
  const totalFoldersPages = Math.ceil(folders.length / itemsPerPage);

  // Funkcie pre prácu so stránkami
  const handleDelete = async () => {
    if (!deleteDialog) return;

    setLoading(true);
    try {
      if (deleteDialog.type === "page") {
        const result = await deletePageAction({ id: deleteDialog.id });
        if (!result.data) throw new Error("Something went wrong");
      } else {
        const result = await deleteFolderAction({ id: deleteDialog.id });
        if (!result.data) throw new Error("Something went wrong");
      }

      // Refresh stránky pre získanie aktuálnych dát
      window.location.reload();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete");
    } finally {
      setLoading(false);
      setDeleteDialog(null);
    }
  };

  const handleEdit = async () => {
    if (!editDialog) return;

    setLoading(true);
    try {
      if (editDialog.type === "page") {
        const result = await updatePageAction({
          id: editDialog.id,
          title: editTitle,
          description: editDescription,
        });
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await updateFolderAction({
          id: editDialog.id,
          title: editTitle,
        });
        if (!result.data) throw new Error("Something went wrong");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update");
    } finally {
      setLoading(false);
      setEditDialog(null);
    }
  };

  const handleMove = async () => {
    if (!moveDialog) return;

    setLoading(true);
    try {
      const result = await movePageAction({
        id: moveDialog.pageId,
        parent_id: selectedFolderId,
      });

      if (!result.data) throw new Error("Failed to move page");

      window.location.reload();
    } catch (error) {
      console.error("Error moving page:", error);
      alert("Failed to move page");
    } finally {
      setLoading(false);
      setMoveDialog(null);
    }
  };

  // Otvorenie dialógov
  const openDeleteDialog = (
    type: "page" | "folder",
    id: string,
    title: string,
  ) => {
    setDeleteDialog({ open: true, type, id, title });
  };

  const openEditDialog = (
    type: "page" | "folder",
    id: string,
    title: string,
    description?: string,
  ) => {
    setEditDialog({ open: true, type, id, title, description });
    setEditTitle(title);
    setEditDescription(description || "");
  };

  const openMoveDialog = (
    pageId: string,
    pageTitle: string,
    currentFolderId?: string | null,
  ) => {
    setMoveDialog({ open: true, pageId, pageTitle, currentFolderId });
    setSelectedFolderId(currentFolderId || null);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
          <File className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-3">
          Welcome to Lexicon
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Select an existing page or folder to start writing.
        </p>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Your Folders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foldersToShow.map((folder) => (
              <div
                key={folder.id}
                className="group relative p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                <Link href={`/folder/${folder.id}`} className="block">
                  <div className="flex items-center mb-2">
                    <Folder className="w-5 h-5 mr-2 text-neutral-500" />
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      {folder.title || "Unnamed Folder"}
                    </h3>
                  </div>
                </Link>

                {/* Dropdown menu pre akcie */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        openEditDialog(
                          "folder",
                          folder.id,
                          folder.title || "Unnamed Folder",
                        )
                      }
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        openDeleteDialog(
                          "folder",
                          folder.id,
                          folder.title || "Unnamed Folder",
                        )
                      }
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalFoldersPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setFoldersPage(Math.max(1, foldersPage - 1))}
                    className={
                      foldersPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalFoldersPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setFoldersPage(i + 1)}
                      isActive={foldersPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setFoldersPage(
                        Math.min(totalFoldersPages, foldersPage + 1),
                      )
                    }
                    className={
                      foldersPage === totalFoldersPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Pages Section */}
      {pages.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Recent Pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagesToShow.map((page) => (
              <div
                key={page.id}
                className="group relative p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                <Link href={`/page/${page.id}`} className="block">
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                    {page.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {page.description || "No description available"}
                  </p>
                </Link>

                {/* Dropdown menu pre akcie */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        openEditDialog(
                          "page",
                          page.id,
                          page.title || "Untitled",
                          page.description,
                        )
                      }
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        openMoveDialog(
                          page.id,
                          page.title || "Untitled",
                          page.parent_id,
                        )
                      }
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Move to Folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        openDeleteDialog(
                          "page",
                          page.id,
                          page.title || "Untitled",
                        )
                      }
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPagesPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPagesPage(Math.max(1, pagesPage - 1))}
                    className={
                      pagesPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPagesPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setPagesPage(i + 1)}
                      isActive={pagesPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPagesPage(Math.min(totalPagesPages, pagesPage + 1))
                    }
                    className={
                      pagesPage === totalPagesPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Empty State */}
      {pages.length === 0 && folders.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            No pages or folders yet. Create your first one to get started!
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog?.open || false}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteDialog?.type} "
              {deleteDialog?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog?.open || false}
        onOpenChange={() => setEditDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editDialog?.type === "page" ? "Page" : "Folder"}
            </DialogTitle>
            <DialogDescription>
              Update the details for this {editDialog?.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder={`Enter ${editDialog?.type} title`}
              />
            </div>
            {editDialog?.type === "page" && (
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter page description"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={loading || !editTitle.trim()}
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Dialog */}
      <Dialog
        open={moveDialog?.open || false}
        onOpenChange={() => setMoveDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Page</DialogTitle>
            <DialogDescription>
              Move "{moveDialog?.pageTitle}" to a different folder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder">Select Folder</Label>
              <Select
                value={selectedFolderId || ""}
                onValueChange={setSelectedFolderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Root (No Folder)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.title || "Unnamed Folder"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMoveDialog(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleMove} disabled={loading}>
              {loading ? "Moving..." : "Move Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
