"use client";

import { useState, useEffect, useMemo } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  Check,
  Circle,
  GripVertical,
  LayoutList,
  LayoutGrid,
  TableIcon,
  Filter,
  TagIcon,
  X,
  Edit,
  Calendar,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createTodoAction,
  deleteTodoAction,
  getTodosAction,
  updateTodoAction,
} from "@/actions/todosActions";

// ----------------------
// Typy
// ----------------------
export type Todo = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: number | null;
  priority: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  tags?: string[];
  notes?: string;
};

type ViewMode = "list" | "board" | "table";
type FilterStatus = "all" | "not_started" | "in_progress" | "done";
type FilterPriority = "all" | "low" | "medium" | "high";

// ----------------------
// Sortable Component
// ----------------------
function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "done":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "not_started":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent ${
        (todo.completed ?? 0) === 1 ? "opacity-60" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <button onClick={() => onToggle(todo)} className="mt-0.5">
        {(todo.completed ?? 0) === 1 ? (
          <Check className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <div className="flex-1">
        <h3
          className={`font-medium ${(todo.completed ?? 0) === 1 ? "line-through" : ""}`}
        >
          {todo.title}
        </h3>
        {todo.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {todo.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {todo.priority && (
            <Badge
              variant="outline"
              className={getPriorityColor(todo.priority)}
            >
              {todo.priority.toUpperCase()}
            </Badge>
          )}
          {todo.status && (
            <Badge variant="outline" className={getStatusColor(todo.status)}>
              {todo.status.replace("_", " ").toUpperCase()}
            </Badge>
          )}
          {todo.tags && todo.tags.length > 0 && (
            <>
              {todo.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <TagIcon className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </>
          )}
          {todo.due_date && (
            <span className="text-xs text-muted-foreground">
              Due: {format(new Date(todo.due_date), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" onClick={() => onEdit(todo)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(todo.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// ----------------------
// Hlavní komponent
// ----------------------
export default function TodoWrapper() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [filterTag, setFilterTag] = useState<string>("all");

  const form = useForm<
    CreateTodoSchema & { status?: string; tags?: string[]; notes?: string }
  >({
    resolver: zodResolver(createTodoSchema) as unknown as Resolver<
      CreateTodoSchema & { status?: string; tags?: string[]; notes?: string }
    >,
    defaultValues: {
      title: "",
      description: "",
      priority: "medium" as const,
      due_date: "",
      status: "not_started",
      tags: [],
      notes: "",
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Načtení todo při inicializaci komponenty
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        const result = await getTodosAction();
        if (result.success && result.data) {
          setTodos(
            result.data.map((todo) => ({
              ...todo,
              created_at: todo.created_at ?? new Date().toISOString(),
              updated_at: todo.updated_at ?? new Date().toISOString(),
              status: todo.status ?? "not_started",
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load todos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    todos.forEach((todo) => {
      todo.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filterStatus !== "all" && todo.status !== filterStatus) return false;
      if (filterPriority !== "all" && todo.priority !== filterPriority)
        return false;
      if (filterTag !== "all" && !todo.tags?.includes(filterTag)) return false;
      return true;
    });
  }, [todos, filterStatus, filterPriority, filterTag]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((t) => t.id === active.id);
      const newIndex = todos.findIndex((t) => t.id === over.id);

      const newTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(newTodos);
    }
  };

  const handleSubmit = async (
    data: CreateTodoSchema & {
      status?: string;
      tags?: string[];
      notes?: string;
    },
  ) => {
    try {
      if (editingTodo) {
        const updatedData = { ...data, completed: editingTodo.completed ?? 0 };
        const result = await updateTodoAction(editingTodo.id, updatedData);
        console.log("Result of update:", result);
        console.log("Updated data:", updatedData);
        if (result.success) {
          setTodos((prev) =>
            prev.map((todo) =>
              todo.id === editingTodo.id
                ? {
                    ...todo,
                    ...updatedData,
                    description: updatedData.description ?? null,
                    status: updatedData.status ?? todo.status,
                  }
                : todo,
            ),
          );
        }
      } else {
        const result = await createTodoAction(data);
        if (result.success && result.data) {
          const newTodo: Todo = {
            ...result.data,
            description: result.data.description ?? null,
            due_date: result.data.due_date ?? null,
            status: data.status ?? "not_started",
            tags: data.tags,
            notes: data.notes,
          };
          setTodos((prev) => [newTodo, ...prev]);
        }
      }
      setDialogOpen(false);
      setEditingTodo(null);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Failed to save todo:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      const result = await deleteTodoAction(id);
      if (result.success) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        router.refresh();
      }
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    const newCompleted = (todo.completed ?? 0) === 1 ? 0 : 1;
    const result = await updateTodoAction(todo.id, {
      completed: newCompleted,
    });
    if (result.success) {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id
            ? {
                ...t,
                completed: newCompleted,
                status: newCompleted === 1 ? "done" : "not_started",
              }
            : t,
        ),
      );
      router.refresh();
    }
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    form.reset({
      title: todo.title,
      description: todo.description ?? "",
      priority: (todo.priority as "low" | "medium" | "high") ?? "medium",
      due_date: todo.due_date ?? "",
      status: todo.status ?? "not_started",
      tags: todo.tags ?? [],
      notes: todo.notes ?? "",
    });
    setDialogOpen(true);
  };

  const addTag = () => {
    const tagInput = form.getValues("tags") || [];
    const newTag = form.getValues("title").split(" ")[0]; // Simple tag from title
    if (newTag && !tagInput.includes(newTag)) {
      form.setValue("tags", [...tagInput, newTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const groupedByStatus = useMemo(() => {
    const groups = {
      not_started: filteredTodos.filter(
        (t) => t.status === "not_started" || !t.status,
      ),
      in_progress: filteredTodos.filter((t) => t.status === "in_progress"),
      done: filteredTodos.filter(
        (t) => t.status === "done" || (t.completed ?? 0) === 1,
      ),
    };
    return groups;
  }, [filteredTodos]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Todos</h1>
          <Button disabled>New Task</Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header s filtry a view módy */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "board" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("board")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterStatus}
            onValueChange={(value: FilterStatus) => setFilterStatus(value)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterPriority}
            onValueChange={(value: FilterPriority) => setFilterPriority(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          {allTags.length > 0 && (
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[140px]">
                <TagIcon className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={() => {
              setEditingTodo(null);
              form.reset({
                title: "",
                description: "",
                priority: "medium",
                due_date: "",
                status: "not_started",
                tags: [],
                notes: "",
              });
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Todo List View s Drag & Drop */}
      {viewMode === "list" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTodos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No todos yet. Create your first task!</p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggleComplete}
                    onDelete={handleDelete}
                    onEdit={openEditDialog}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Board View */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(["not_started", "in_progress", "done"] as const).map((status) => (
            <div key={status} className="rounded-lg border p-4">
              <h3 className="mb-4 font-semibold capitalize">
                {status.replace("_", " ")} ({groupedByStatus[status].length})
              </h3>
              <div className="space-y-2">
                {groupedByStatus[status].map((todo) => (
                  <div
                    key={todo.id}
                    className={`group rounded-lg border p-3 transition-colors hover:bg-accent ${
                      (todo.completed ?? 0) === 1 ? "opacity-60" : ""
                    }`}
                    onClick={() => setSelectedTodo(todo)}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(todo);
                        }}
                        className="mt-0.5"
                      >
                        {(todo.completed ?? 0) === 1 ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4
                          className={`text-sm font-medium ${(todo.completed ?? 0) === 1 ? "line-through" : ""}`}
                        >
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {todo.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {todo.priority && (
                            <Badge variant="outline" className="text-xs">
                              {todo.priority}
                            </Badge>
                          )}
                          {todo.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(todo);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(todo.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {groupedByStatus[status].length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No todos
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left text-sm font-medium">Status</th>
                <th className="p-3 text-left text-sm font-medium">Title</th>
                <th className="p-3 text-left text-sm font-medium">Priority</th>
                <th className="p-3 text-left text-sm font-medium">Tags</th>
                <th className="p-3 text-left text-sm font-medium">Due Date</th>
                <th className="p-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTodos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No todos match your filters
                  </td>
                </tr>
              ) : (
                filteredTodos.map((todo) => (
                  <tr
                    key={todo.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-3">
                      <button onClick={() => handleToggleComplete(todo)}>
                        {(todo.completed ?? 0) === 1 ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <div>
                        <p
                          className={`font-medium ${(todo.completed ?? 0) === 1 ? "line-through" : ""}`}
                        >
                          {todo.title}
                        </p>
                        {todo.description && (
                          <p className="text-xs text-muted-foreground">
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {todo.priority && (
                        <Badge variant="outline" className="text-xs">
                          {todo.priority}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {todo.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {todo.due_date
                        ? format(new Date(todo.due_date), "MMM d, yyyy")
                        : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(todo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(todo.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

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

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                {...form.register("description")}
                placeholder="Details..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(v: "low" | "medium" | "high") =>
                    form.setValue("priority", v)
                  }
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
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v: "not_started" | "in_progress" | "done") =>
                    form.setValue("status", v)
                  }
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <Input
                  {...form.register("due_date")}
                  type="date"
                  placeholder="Select date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag}>
                    Add Tag
                  </Button>
                </div>
                {form.watch("tags") && form.watch("tags")!.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.watch("tags")!.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                {...form.register("notes")}
                placeholder="Additional notes..."
                rows={4}
              />
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

      <Sheet open={!!selectedTodo} onOpenChange={() => setSelectedTodo(null)}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px]">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl font-bold wrap-break">
                  {selectedTodo?.title}
                </SheetTitle>
                <SheetDescription className="mt-2 text-base">
                  {selectedTodo?.description || "No description provided"}
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (selectedTodo) {
                    setEditingTodo(selectedTodo);
                    form.reset({
                      title: selectedTodo.title,
                      description: selectedTodo.description || "",
                      priority:
                        (selectedTodo.priority as "low" | "medium" | "high") ||
                        "medium",
                      due_date: selectedTodo.due_date || "",
                      status: selectedTodo.status || "not_started",
                      tags: selectedTodo.tags || [],
                      notes: selectedTodo.notes || "",
                    });
                    setSelectedTodo(null);
                    setDialogOpen(true);
                  }
                }}
                className="shrink-0 mt-6"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {selectedTodo && (
            <div className="mt-6 space-y-6 p-5">
              {/* Status & Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Circle
                      className={`h-3 w-3 ${
                        (selectedTodo.completed ?? 0) === 1
                          ? "text-green-500 fill-green-500"
                          : selectedTodo.status === "in_progress"
                            ? "text-blue-500 fill-blue-500"
                            : "text-gray-500 fill-gray-500"
                      }`}
                    />
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`
                  ${
                    (selectedTodo.completed ?? 0) === 1
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : selectedTodo.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                  }
                  capitalize
                `}
                    >
                      {(selectedTodo.completed ?? 0) === 1
                        ? "Completed"
                        : selectedTodo.status?.replace("_", " ") ||
                          "Not Started"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Priority
                  </p>
                  <Badge
                    variant="outline"
                    className={`
                ${
                  selectedTodo.priority === "high"
                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                    : selectedTodo.priority === "medium"
                      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      : "bg-green-500/10 text-green-600 border-green-500/20"
                }
                capitalize
              `}
                  >
                    {selectedTodo.priority || "Not set"}
                  </Badge>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Due Date
                </p>
                <div className="flex items-center gap-2">
                  {selectedTodo.due_date ? (
                    <>
                      <Badge variant="secondary" className="font-normal">
                        {format(new Date(selectedTodo.due_date), "MMM d, yyyy")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(selectedTodo.due_date), "EEEE")}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No due date set
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {selectedTodo.tags && selectedTodo.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-muted-foreground" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTodo.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-2 py-1 text-xs font-medium"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTodo.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Notes</p>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedTodo.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Task Information
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {format(
                        new Date(selectedTodo.created_at),
                        "MMM d, yyyy 'at' HH:mm",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {format(
                        new Date(selectedTodo.updated_at),
                        "MMM d, yyyy 'at' HH:mm",
                      )}
                    </span>
                  </div>
                  {selectedTodo.due_date && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        Days Remaining
                      </span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(selectedTodo.due_date).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (selectedTodo) {
                  setEditingTodo(selectedTodo);
                  form.reset({
                    title: selectedTodo.title,
                    description: selectedTodo.description || "",
                    priority:
                      (selectedTodo.priority as "low" | "medium" | "high") ||
                      "medium",
                    due_date: selectedTodo.due_date || "",
                    status: selectedTodo.status || "not_started",
                    tags: selectedTodo.tags || [],
                    notes: selectedTodo.notes || "",
                  });
                  setSelectedTodo(null);
                  setDialogOpen(true);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedTodo(null)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
