"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useTodos } from "@/hooks/useTodos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  createTodoSchema,
  type CreateTodoSchema,
} from "@/actions/schemas/todosSchemas";

// ----------------------
// Typy
// ----------------------
export type Todo = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: number;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

// ----------------------
// Komponent
// ----------------------
export default function TodoWrapper({ userId }: { userId: string }) {
  const { todos, loading, createTodo, updateTodo, deleteTodo } = useTodos(userId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const form = useForm({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    },
  });

  const handleSubmit = async (data: CreateTodoSchema) => {
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, data);
      } else {
        await createTodo(data);
      }
      setDialogOpen(false);
      setEditingTodo(null);
      form.reset();
    } catch (error) {
      console.error("Failed to save todo:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p className="text-muted-foreground">Loading todos...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Todos</h1>
        <Button
          onClick={() => {
            setEditingTodo(null);
            form.reset({
              title: "",
              description: "",
              priority: "medium",
              due_date: "",
            });
            setDialogOpen(true);
          }}
        >
          New Task
        </Button>
      </div>

      {/* Todo List */}
      {todos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No todos yet. Create your first task!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex justify-between items-center border rounded-lg p-3 hover:bg-muted cursor-pointer"
              onClick={() => setSelectedTodo(todo)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed === 1}
                  onChange={(e) => {
                    e.stopPropagation();
                    // toggle completed: assert the payload includes completed so TS accepts it
                    updateTodo(
                      todo.id,
                      { completed: todo.completed === 1 ? 0 : 1 } as Partial<
                        CreateTodoSchema & { completed?: number }
                      >
                    );
                  }}
                  className="w-4 h-4"
                />
                <div>
                  <p className={`font-medium ${todo.completed === 1 ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {todo.description || "No description"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingTodo(todo);
                    form.reset({
                      title: todo.title,
                      description: todo.description || "",
                      priority: todo.priority,
                      due_date: todo.due_date || "",
                    });
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this todo?")) {
                      deleteTodo(todo.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog: Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTodo ? "Edit Task" : "New Task"}</DialogTitle>
            <DialogDescription>
              {editingTodo
                ? "Update your existing task"
                : "Create a new task to track"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input {...form.register("title")} placeholder="Task title" />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                {...form.register("description")} 
                placeholder="Details..." 
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(v: "low" | "medium" | "high") => form.setValue("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <Input 
                  {...form.register("due_date")} 
                  type="date"
                  placeholder="Select date" 
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingTodo(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingTodo ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sheet: Detail view */}
      <Sheet open={!!selectedTodo} onOpenChange={() => setSelectedTodo(null)}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle>{selectedTodo?.title}</SheetTitle>
            <SheetDescription>
              {selectedTodo?.description || "No description"}
            </SheetDescription>
          </SheetHeader>
          {selectedTodo && (
            <div className="mt-6 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm capitalize">
                  {selectedTodo.completed === 1 ? "Completed" : "Not Completed"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <p className="text-sm capitalize">{selectedTodo.priority}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className="text-sm">
                  {selectedTodo.due_date
                    ? format(new Date(selectedTodo.due_date), "MMM d, yyyy")
                    : "No due date"}
                </p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Created: {format(new Date(selectedTodo.created_at), "MMM d, yyyy HH:mm")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated: {format(new Date(selectedTodo.updated_at), "MMM d, yyyy HH:mm")}
                </p>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (selectedTodo) {
                  setEditingTodo(selectedTodo);
                  form.reset({
                    title: selectedTodo.title,
                    description: selectedTodo.description || "",
                    priority: selectedTodo.priority as "low" | "medium" | "high",
                    due_date: selectedTodo.due_date || "",
                  });
                  setSelectedTodo(null);
                  setDialogOpen(true);
                }
              }}
            >
              Edit
            </Button>
            <Button variant="outline" onClick={() => setSelectedTodo(null)}>
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}