"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  File,
  Folder,
  MoreHorizontal,
  Pencil,
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
  updateFolderAction,
  getFolderDetailAction,
} from "@/actions/folderActions";
import { moveToTrashAction } from "@/actions/trashActions";
import { updatePageHandler } from "@/actions/pagesActions";
import { movePageHandler } from "@/actions/pagesActions";

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
      return <PageActions page={page} />;
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
      return <FolderActions folder={folder} />;
    },
  },
];

// Komponent pre akcie stránky
const PageActions = ({ page }: { page: Page }) => {
  const openEditDialog = useCallback(() => {
    (window as any).openEditDialog?.(
      "page",
      page.id,
      page.title || "Untitled",
      page.description,
    );
  }, [page]);

  const openMoveDialog = useCallback(() => {
    (window as any).openMoveDialog?.(
      page.id,
      page.title || "Untitled",
      page.parent_id,
    );
  }, [page]);

  const openMoveToTrashDialog = useCallback(() => {
    (window as any).openMoveToTrashDialog?.(
      "page",
      page.id,
      page.title || "Untitled",
    );
  }, [page]);

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
        <DropdownMenuItem onClick={openEditDialog}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openMoveDialog}>
          <Move className="h-4 w-4 mr-2" />
          Move
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={openMoveToTrashDialog} className="text-amber-600">
          <Trash className="h-4 w-4 mr-2" />
          Move to Trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Komponent pre akcie priečinka
const FolderActions = ({ folder }: { folder: FolderType }) => {
  const openFolderDetailDialog = useCallback(() => {
    (window as any).openFolderDetailDialog?.(folder.id);
  }, [folder.id]);

  const openEditDialog = useCallback(() => {
    (window as any).openEditDialog?.(
      "folder",
      folder.id,
      folder.title || "Unnamed Folder",
    );
  }, [folder]);

  const openMoveToTrashDialog = useCallback(() => {
    (window as any).openMoveToTrashDialog?.(
      "folder",
      folder.id,
      folder.title || "Unnamed Folder",
    );
  }, [folder]);

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={openFolderDetailDialog}>
        View Contents
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openEditDialog}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openMoveToTrashDialog} className="text-amber-600">
            <Trash className="h-4 w-4 mr-2" />
            Move to Trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

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

  // State pre formuláre
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Memoizované hodnoty pre pagináciu
  const pagesToShow = useMemo(() => {
    const start = (pagesPage - 1) * itemsPerPage;
    return pages.slice(start, start + itemsPerPage);
  }, [pages, pagesPage, itemsPerPage]);

  const foldersToShow = useMemo(() => {
    const start = (foldersPage - 1) * itemsPerPage;
    return folders.slice(start, start + itemsPerPage);
  }, [folders, foldersPage, itemsPerPage]);

  const totalPagesPages = Math.ceil(pages.length / itemsPerPage);
  const totalFoldersPages = Math.ceil(folders.length / itemsPerPage);

  // Funkcie pre načítanie dát
  const loadFolderDetail = useCallback(async (folderId: string) => {
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
  }, []);

  // Otvorenie dialogu pre detail priečinka
  const openFolderDetailDialog = useCallback(async (folderId: string) => {
    setFolderDetailDialog({
      open: true,
      folderId,
      data: null,
      loading: true,
    });
    await loadFolderDetail(folderId);
  }, [loadFolderDetail]);

  // Funkcia pre presun do koša
  const handleMoveToTrash = useCallback(async () => {
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
  }, [moveToTrashDialog]);

  const handleEdit = useCallback(async () => {
    if (!editDialog) return;
    
    setLoading(true);
    try {
      if (editDialog.type === "page") {
        const result = await updatePageHandler(editDialog.id, {
          title: editTitle,
          description: editDescription,
        });
       if (!result) throw new Error("Something went wrong");
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
  }, [editDialog, editTitle, editDescription]);

  const handleMove = useCallback(async () => {
    if (!moveDialog) return;
    
    setLoading(true);
    try {
      const result = await movePageHandler(moveDialog.pageId, selectedFolderId);
      if (!result) throw new Error("Failed to move page");
      window.location.reload();
    } catch (error) {
      console.error("Error moving page:", error);
      alert("Failed to move page");
    } finally {
      setLoading(false);
      setMoveDialog(null);
    }
  }, [moveDialog, selectedFolderId]);

  // Funkcie pre otváranie dialógov
  const openMoveToTrashDialog = useCallback((
    type: "page" | "folder",
    id: string,
    title: string,
  ) => {
    setMoveToTrashDialog({ open: true, type, id, title });
  }, []);

  const openEditDialog = useCallback((
    type: "page" | "folder",
    id: string,
    title: string,
    description?: string,
  ) => {
    setEditDialog({ open: true, type, id, title, description });
    setEditTitle(title);
    setEditDescription(description || "");
  }, []);

  const openMoveDialog = useCallback((
    pageId: string,
    pageTitle: string,
    currentFolderId?: string | null,
  ) => {
    setMoveDialog({ open: true, pageId, pageTitle, currentFolderId });
    setSelectedFolderId(currentFolderId || null);
  }, []);

  // Vystavenie funkcií pre globálny prístup
  useEffect(() => {
    (window as any).openEditDialog = openEditDialog;
    (window as any).openMoveDialog = openMoveDialog;
    (window as any).openFolderDetailDialog = openFolderDetailDialog;
    (window as any).openMoveToTrashDialog = openMoveToTrashDialog;

    return () => {
      // Cleanup
      (window as any).openEditDialog = undefined;
      (window as any).openMoveDialog = undefined;
      (window as any).openFolderDetailDialog = undefined;
      (window as any).openMoveToTrashDialog = undefined;
    };
  }, [openEditDialog, openMoveDialog, openFolderDetailDialog, openMoveToTrashDialog]);

  // Vytvorenie tabuliek pre detail priečinka
  const pagesTable = useReactTable({
    data: folderDetailDialog.data?.pages || [],
    columns: pageColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const foldersTable = useReactTable({
    data: folderDetailDialog.data?.subfolders || [],
    columns: folderColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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
        <FoldersSection
          folders={foldersToShow}
          currentPage={foldersPage}
          totalPages={totalFoldersPages}
          onPageChange={setFoldersPage}
          onFolderClick={openFolderDetailDialog}
        />
      )}

      {/* Pages Section */}
      {pages.length > 0 && (
        <PagesSection
          pages={pagesToShow}
          currentPage={pagesPage}
          totalPages={totalPagesPages}
          onPageChange={setPagesPage}
        />
      )}

      {/* Empty State */}
      {pages.length === 0 && folders.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            No pages or folders yet. Create your first one to get started!
          </p>
        </div>
      )}

      {/* Dialógy */}
      <FolderDetailDialog
        dialog={folderDetailDialog}
        onClose={() => setFolderDetailDialog(prev => ({ ...prev, open: false }))}
        pagesTable={pagesTable}
        foldersTable={foldersTable}
      />

      <MoveToTrashDialog
        dialog={moveToTrashDialog}
        onClose={() => setMoveToTrashDialog(null)}
        onConfirm={handleMoveToTrash}
        loading={loading}
      />

      <EditDialog
        dialog={editDialog}
        onClose={() => setEditDialog(null)}
        onConfirm={handleEdit}
        loading={loading}
        editTitle={editTitle}
        editDescription={editDescription}
        onTitleChange={setEditTitle}
        onDescriptionChange={setEditDescription}
      />

      <MoveDialog
        dialog={moveDialog}
        onClose={() => setMoveDialog(null)}
        onConfirm={handleMove}
        loading={loading}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onFolderChange={setSelectedFolderId}
      />
    </div>
  );
}

// Komponenty pre sekcie
const FoldersSection = ({
  folders,
  currentPage,
  totalPages,
  onPageChange,
  onFolderClick,
}: {
  folders: FolderType[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onFolderClick: (id: string) => void;
}) => (
  <div className="mt-16">
    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
      Your Folders
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} onClick={onFolderClick} />
      ))}
    </div>
    <PaginationComponent
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  </div>
);

const PagesSection = ({
  pages,
  currentPage,
  totalPages,
  onPageChange,
}: {
  pages: Page[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="mt-16">
    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
      Recent Pages
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((page) => (
        <PageCard key={page.id} page={page} />
      ))}
    </div>
    <PaginationComponent
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  </div>
);

// Komponenty pre karty
const FolderCard = ({ 
  folder, 
  onClick 
}: { 
  folder: FolderType; 
  onClick: (id: string) => void 
}) => (
  <div className="group relative p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
    <div
      onClick={() => onClick(folder.id)}
      className="block cursor-pointer"
    >
      <div className="flex items-center mb-2">
        <Folder className="w-5 h-5 mr-2 text-neutral-500" />
        <h3 className="font-medium text-neutral-900 dark:text-white">
          {folder.title || "Unnamed Folder"}
        </h3>
      </div>
    </div>
    <FolderActions folder={folder} />
  </div>
);

const PageCard = ({ page }: { page: Page }) => (
  <div className="group relative p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
    <Link href={`/page/${page.id}`} className="block">
      <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
        {page.title || "Untitled"}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
        {page.description || "No description available"}
      </p>
    </Link>
    <PageActions page={page} />
  </div>
);

// Komponent pre pagináciu
const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i + 1)}
              isActive={currentPage === i + 1}
              className="cursor-pointer"
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

// Komponenty pre dialógy
const FolderDetailDialog = ({
  dialog,
  onClose,
  pagesTable,
  foldersTable,
}: {
  dialog: { open: boolean; data: FolderDetail | null; loading: boolean };
  onClose: () => void;
  pagesTable: any;
  foldersTable: any;
}) => (
  <Dialog open={dialog.open} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Folder className="w-5 h-5 mr-2" />
          {dialog.data?.folder.title || "Folder Contents"}
        </DialogTitle>
        <DialogDescription>
          View and manage files and subfolders in this folder
        </DialogDescription>
      </DialogHeader>

      {dialog.loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      ) : dialog.data ? (
        <div className="space-y-6">
          <TableSection
            title={`Pages (${dialog.data.pages.length})`}
            table={pagesTable}
            columns={pageColumns}
            isEmpty={dialog.data.pages.length === 0}
          />
          <TableSection
            title={`Subfolders (${dialog.data.subfolders.length})`}
            table={foldersTable}
            columns={folderColumns}
            isEmpty={dialog.data.subfolders.length === 0}
          />
          {dialog.data.pages.length === 0 && dialog.data.subfolders.length === 0 && (
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
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const TableSection = ({ 
  title, 
  table, 
  columns, 
  isEmpty 
}: { 
  title: string; 
  table: any; 
  columns: ColumnDef<any>[]; 
  isEmpty: boolean 
}) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
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
          {!isEmpty ? (
            table.getRowModel().rows.map((row: any) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </div>
);

const MoveToTrashDialog = ({
  dialog,
  onClose,
  onConfirm,
  loading,
}: {
  dialog: { open: boolean; type?: string; title?: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <AlertDialog open={dialog?.open || false} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Move to Trash</AlertDialogTitle>
        <AlertDialogDescription>
          This will move the {dialog?.type} "{dialog?.title}" to trash. You can restore it later
          from the trash.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {loading ? "Moving..." : "Move to Trash"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const EditDialog = ({
  dialog,
  onClose,
  onConfirm,
  loading,
  editTitle,
  editDescription,
  onTitleChange,
  onDescriptionChange,
}: {
  dialog: { open: boolean; type?: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  editTitle: string;
  editDescription: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}) => (
  <Dialog open={dialog?.open || false} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Edit {dialog?.type === "page" ? "Page" : "Folder"}
        </DialogTitle>
        <DialogDescription>
          Update the details for this {dialog?.type}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={editTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={`Enter ${dialog?.type} title`}
          />
        </div>
        {dialog?.type === "page" && (
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={editDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter page description"
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={loading || !editTitle.trim()}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const MoveDialog = ({
  dialog,
  onClose,
  onConfirm,
  loading,
  folders,
  selectedFolderId,
  onFolderChange,
}: {
  dialog: { open: boolean; pageTitle?: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  folders: FolderType[];
  selectedFolderId: string | null;
  onFolderChange: (value: string | null) => void;
}) => (
  <Dialog open={dialog?.open || false} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Move Page</DialogTitle>
        <DialogDescription>
          Move "{dialog?.pageTitle}" to a different folder.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="folder">Select Folder</Label>
          <Select
            value={selectedFolderId || ""}
            onValueChange={onFolderChange}
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
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          {loading ? "Moving..." : "Move Page"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);