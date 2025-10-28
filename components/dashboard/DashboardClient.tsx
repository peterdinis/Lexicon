"use client";

import { useState, useEffect } from "react";
import {
  File,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
  Move,
  Trash,
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
  getFolderDetailAction,
} from "@/actions/folderActions";
import { moveToTrashAction } from "@/actions/trashActions";

// Importy pre tabuľku
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Page {
  id: string;
  title?: string;
  description?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface FolderType {
  id: string;
  title?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface FolderDetail {
  folder: FolderType;
  pages: Page[];
  subfolders: FolderType[];
}

interface DashboardClientProps {
  pages: Page[];
  folders: FolderType[];
  itemsPerPage?: number;
}

// Definícia stĺpcov pre tabuľku stránok
const pageColumns: ColumnDef<Page>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title") || "Untitled"}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-sm text-neutral-500">
        {row.getValue("description") || "No description"}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("created_at")
          ? new Date(row.getValue("created_at")).toLocaleDateString()
          : "Unknown"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const page = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/page/${page.id}`}>Open</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                (window as any).openEditDialog?.(
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
                (window as any).openMoveDialog?.(
                  page.id,
                  page.title || "Untitled",
                  page.parent_id,
                )
              }
            >
              <Move className="h-4 w-4 mr-2" />
              Move
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                (window as any).openMoveToTrashDialog?.(
                  "page",
                  page.id,
                  page.title || "Untitled",
                )
              }
              className="text-amber-600"
            >
              <Trash className="h-4 w-4 mr-2" />
              Move to Trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Definícia stĺpcov pre tabuľku priečinkov
const folderColumns: ColumnDef<FolderType>[] = [
  {
    accessorKey: "title",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium flex items-center">
        <Folder className="w-4 h-4 mr-2 text-neutral-500" />
        {row.getValue("title") || "Unnamed Folder"}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("created_at")
          ? new Date(row.getValue("created_at")).toLocaleDateString()
          : "Unknown"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const folder = row.original;

      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window as any).openFolderDetailDialog?.(folder.id)}
          >
            View Contents
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  (window as any).openEditDialog?.(
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
                  (window as any).openMoveToTrashDialog?.(
                    "folder",
                    folder.id,
                    folder.title || "Unnamed Folder",
                  )
                }
                className="text-amber-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function DashboardClient({
  pages,
  folders,
  itemsPerPage = 6,
}: DashboardClientProps) {
  const [pagesPage, setPagesPage] = useState(1);
  const [foldersPage, setFoldersPage] = useState(1);

  // State pre dialógy
  const [moveToTrashDialog, setMoveToTrashDialog] = useState<{
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

  const [folderDetailDialog, setFolderDetailDialog] = useState<{
    open: boolean;
    folderId: string | null;
    data: FolderDetail | null;
    loading: boolean;
  }>({
    open: false,
    folderId: null,
    data: null,
    loading: false,
  });

  // State pre tabuľky
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // State pre formuláre
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Vytvorenie tabuliek pre detail priečinka
  const pagesTable = useReactTable({
    data: folderDetailDialog.data?.pages || [],
    columns: pageColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const foldersTable = useReactTable({
    data: folderDetailDialog.data?.subfolders || [],
    columns: folderColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const pagesStart = (pagesPage - 1) * itemsPerPage;
  const foldersStart = (foldersPage - 1) * itemsPerPage;

  const pagesToShow = pages.slice(pagesStart, pagesStart + itemsPerPage);
  const foldersToShow = folders.slice(
    foldersStart,
    foldersStart + itemsPerPage,
  );

  const totalPagesPages = Math.ceil(pages.length / itemsPerPage);
  const totalFoldersPages = Math.ceil(folders.length / itemsPerPage);

  const loadFolderDetail = async (folderId: string) => {
    setFolderDetailDialog((prev) => ({ ...prev, loading: true }));
    try {
      const result = await getFolderDetailAction({ id: folderId });

      if (result.data) {
        setFolderDetailDialog((prev) => ({
          ...prev,
          data: result.data as unknown as FolderDetail,
          loading: false,
        }));
      } else {
        setFolderDetailDialog((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error loading folder detail:", error);
      setFolderDetailDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  // Otvorenie dialogu pre detail priečinka
  const openFolderDetailDialog = async (folderId: string) => {
    setFolderDetailDialog({
      open: true,
      folderId,
      data: null,
      loading: true,
    });
    await loadFolderDetail(folderId);
  };

  // Funkcia pre presun do koša
  const handleMoveToTrash = async () => {
    if (!moveToTrashDialog) return;
    setLoading(true);
    try {
      const result = await moveToTrashAction({
        id: moveToTrashDialog.id,
        table: moveToTrashDialog.type === "page" ? "pages" : "folders",
      });
      
      if (!result.data) throw new Error("Failed to move to trash");
      
      window.location.reload();
    } catch (error) {
      console.error("Error moving to trash:", error);
      alert("Failed to move to trash");
    } finally {
      setLoading(false);
      setMoveToTrashDialog(null);
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

  const openMoveToTrashDialog = (
    type: "page" | "folder",
    id: string,
    title: string,
  ) => {
    setMoveToTrashDialog({ open: true, type, id, title });
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

  // Vystavenie funkcií pre globálny prístup
  useEffect(() => {
    (window as any).openEditDialog = openEditDialog;
    (window as any).openMoveDialog = openMoveDialog;
    (window as any).openFolderDetailDialog = openFolderDetailDialog;
    (window as any).openMoveToTrashDialog = openMoveToTrashDialog;
  }, []);

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
                <div
                  onClick={() => openFolderDetailDialog(folder.id)}
                  className="block cursor-pointer"
                >
                  <div className="flex items-center mb-2">
                    <Folder className="w-5 h-5 mr-2 text-neutral-500" />
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      {folder.title || "Unnamed Folder"}
                    </h3>
                  </div>
                </div>

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
                      onClick={() => openFolderDetailDialog(folder.id)}
                    >
                      View Contents
                    </DropdownMenuItem>
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
                        openMoveToTrashDialog(
                          "folder",
                          folder.id,
                          folder.title || "Unnamed Folder",
                        )
                      }
                      className="text-amber-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Move to Trash
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
                        openMoveToTrashDialog(
                          "page",
                          page.id,
                          page.title || "Untitled",
                        )
                      }
                      className="text-amber-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Move to Trash
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

      {/* Folder Detail Dialog */}
      <Dialog
        open={folderDetailDialog.open}
        onOpenChange={(open) =>
          setFolderDetailDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Folder className="w-5 h-5 mr-2" />
              {folderDetailDialog.data?.folder.title || "Folder Contents"}
            </DialogTitle>
            <DialogDescription>
              View and manage files and subfolders in this folder
            </DialogDescription>
          </DialogHeader>

          {folderDetailDialog.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
            </div>
          ) : folderDetailDialog.data ? (
            <div className="space-y-6">
              {/* Pages Table */}
              {folderDetailDialog.data.pages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Pages ({folderDetailDialog.data.pages.length})
                  </h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        {pagesTable.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {pagesTable.getRowModel().rows?.length ? (
                          pagesTable.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={pageColumns.length}
                              className="h-24 text-center"
                            >
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Subfolders Table */}
              {folderDetailDialog.data.subfolders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Subfolders ({folderDetailDialog.data.subfolders.length})
                  </h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        {foldersTable.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {foldersTable.getRowModel().rows?.length ? (
                          foldersTable.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={folderColumns.length}
                              className="h-24 text-center"
                            >
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {folderDetailDialog.data.pages.length === 0 &&
                folderDetailDialog.data.subfolders.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    This folder is empty
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              Failed to load folder contents
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setFolderDetailDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Trash Dialog */}
      <AlertDialog
        open={moveToTrashDialog?.open || false}
        onOpenChange={() => setMoveToTrashDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the {moveToTrashDialog?.type} "{moveToTrashDialog?.title}" to trash. 
              You can restore it later from the trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMoveToTrash}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? "Moving..." : "Move to Trash"}
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