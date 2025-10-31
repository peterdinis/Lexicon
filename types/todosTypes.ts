export interface TodoUpdateData {
  title?: string;
  description?: string | null;
  priority?: "low" | "medium" | "high";
  due_date?: Date | null;
  completed?: boolean | null;
  status?: string;
  tags?: string | null;
  notes?: string | null;
  updated_at: Date;
}

export interface TodoResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}