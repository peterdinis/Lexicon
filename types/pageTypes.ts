export interface Page {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  icon?: string | null;
  cover_image?: string | null;
  parent_id?: string | null;
  is_folder?: boolean;
  in_trash?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
  deleted_at?: string | Date;
}