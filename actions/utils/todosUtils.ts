export const transformTodoData = (todo: {
  completed: boolean | null;
  due_date: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  notes: string | null;
}) => ({
  ...todo,
  completed: todo.completed,
  due_date: todo.due_date ? todo.due_date.toISOString() : null,
  created_at: todo.created_at!.toISOString(),
  updated_at: todo.updated_at!.toISOString(),
});
