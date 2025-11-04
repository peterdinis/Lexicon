import { Table as ReactTable } from "@tanstack/react-table";

export interface Page {
  id: string;
  title?: string;
  description?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FolderType {
  id: string;
  title?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FolderDetail {
  folder: FolderType;
  pages: Page[];
  subfolders: FolderType[];
}

export interface DashboardClientProps {
  pages: Page[];
  folders: FolderType[];
  itemsPerPage?: number;
}

export interface MoveToTrashDialogState {
  open: boolean;
  type: "page" | "folder";
  id: string;
  title: string;
}

export interface EditDialogState {
  open: boolean;
  type: "page" | "folder";
  id: string;
  title: string;
  description?: string;
}

export interface MoveDialogState {
  open: boolean;
  pageId: string;
  pageTitle: string;
  currentFolderId?: string | null;
}

export interface FolderDetailDialogState {
  open: boolean;
  folderId: string | null;
  data: FolderDetail | null;
  loading: boolean;
}

export interface TableHeaderProps<T> {
  table: ReactTable<T>;
}
