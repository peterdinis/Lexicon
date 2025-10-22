"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTodos } from "@/hooks/useTodos";
import { format } from "date-fns";

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

export default function TodoWrapper() {
  const { todos, createTodo, updateTodo, deleteTodo } = useTodos(initialTodos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<any | null>(null);
  const [editingTodo, setEditingTodo] = useState<any | null>(null);

  const form = useForm<CreateTodoSchema>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "not_started",
    },
  });

  const handleSubmit = async (data: CreateTodoSchema) => {
    if (editingTodo) {
      await updateTodo(editingTodo.id, data);
    } else {
      await createTodo(data);
    }
    setDialogOpen(false);
    setEditingTodo(null);
    form.reset();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Todos</h1>
        <Button
          onClick={() => {
            setEditingTodo(null);
            form.reset();
            setDialogOpen(true);
          }}
        >
          New Task
        </Button>
      </div>

      {/* Todo list */}
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex justify-between items-center border rounded-lg p-3 hover:bg-muted cursor-pointer"
            onClick={() => setSelectedTodo(todo)}
          >
            <div>
              <p className="font-medium">{todo.title}</p>
              <p className="text-sm text-muted-foreground">
                {todo.description || "No description"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTodo(todo);
                  form.reset(todo);
                  setDialogOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTodo(todo.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

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
              <label className="block text-sm font-medium">Title</label>
              <Input {...form.register("title")} placeholder="Task title" />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <Textarea
                {...form.register("description")}
                placeholder="Details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Priority</label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(v) => form.setValue("priority", v)}
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
                <label className="block text-sm font-medium">Status</label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTodo ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sheet: Detail view */}
      <Sheet open={!!selectedTodo} onOpenChange={() => setSelectedTodo(null)}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle>{selectedTodo?.title}</SheetTitle>
            <SheetDescription>{selectedTodo?.description}</SheetDescription>
          </SheetHeader>
          {selectedTodo && (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Status:</strong> {selectedTodo.status}
              </p>
              <p>
                <strong>Priority:</strong> {selectedTodo.priority}
              </p>
              <p>
                <strong>Due Date:</strong>{" "}
                {selectedTodo.due_date
                  ? format(new Date(selectedTodo.due_date), "MMM d, yyyy")
                  : "—"}
              </p>
              {selectedTodo.notes && (
                <p className="mt-2">
                  <strong>Notes:</strong> {selectedTodo.notes}
                </p>
              )}
            </div>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedTodo(null)}>
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
