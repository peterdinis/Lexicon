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