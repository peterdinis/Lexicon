"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Todo } from "@/lib/types";
import { format } from "date-fns";
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

interface TodoWrapperProps {
  initialTodos: Todo[];
}

type ViewMode = "list" | "board" | "table";
type FilterStatus = "all" | "not_started" | "in_progress" | "done";
type FilterPriority = "all" | "low" | "medium" | "high";

function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
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

  const getPriorityColor = (priority: string) => {
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
        todo.completed ? "opacity-60" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <button
        onClick={() => onToggle(todo.id, todo.completed)}
        className="mt-0.5"
      >
        {todo.completed ? (
          <Check className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <div className="flex-1">
        <h3 className={`font-medium ${todo.completed ? "line-through" : ""}`}>
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

export function TodoWrapper({ initialTodos }: TodoWrapperProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "not_started" as "not_started" | "in_progress" | "done",
    due_date: "",
    tags: [] as string[],
    notes: "",
  });
  const [tagInput, setTagInput] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

      // Update positions in the backend
      try {
        await fetch("/api/todos/reorder", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            todoId: active.id,
            newPosition: newIndex,
          }),
        });
      } catch (error) {
        console.error("Error reordering todos:", error);
        setTodos(todos); // Revert on error
      }
    }
  };

  const createOrUpdateTodo = async () => {
    if (!newTodo.title.trim()) return;

    try {
      if (editingTodo) {
        // Update existing todo
        const response = await fetch(`/api/todos/${editingTodo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTodo),
        });

        if (!response.ok) throw new Error("Failed to update todo");

        const updatedTodo = await response.json();
        setTodos(todos.map((t) => (t.id === editingTodo.id ? updatedTodo : t)));
      } else {
        // Create new todo
        const response = await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTodo),
        });

        if (!response.ok) throw new Error("Failed to create todo");

        const todo = await response.json();
        setTodos([...todos, todo]);
      }

      setNewTodo({
        title: "",
        description: "",
        priority: "medium",
        status: "not_started",
        due_date: "",
        tags: [],
        notes: "",
      });
      setEditingTodo(null);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving todo:", error);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      const updatedTodo = await response.json();
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTodo({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority || "medium",
      status: todo.status || "not_started",
      due_date: todo.due_date || "",
      tags: todo.tags || [],
      notes: todo.notes || "",
    });
    setDialogOpen(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !newTodo.tags.includes(tagInput.trim())) {
      setNewTodo({ ...newTodo, tags: [...newTodo.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setNewTodo({ ...newTodo, tags: newTodo.tags.filter((t) => t !== tag) });
  };

  const groupedByStatus = useMemo(() => {
    const groups = {
      not_started: filteredTodos.filter((t) => t.status === "not_started"),
      in_progress: filteredTodos.filter((t) => t.status === "in_progress"),
      done: filteredTodos.filter((t) => t.status === "done"),
    };
    return groups;
  }, [filteredTodos]);

  return (
    <div className="space-y-4">
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
            onValueChange={(value: any) => setFilterStatus(value)}
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
            onValueChange={(value: any) => setFilterPriority(value)}
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

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingTodo(null);
                setNewTodo({
                  title: "",
                  description: "",
                  priority: "medium",
                  status: "not_started",
                  due_date: "",
                  tags: [],
                  notes: "",
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Todo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTodo ? "Edit Todo" : "Create New Todo"}
                </DialogTitle>
                <DialogDescription>
                  {editingTodo
                    ? "Update your task details"
                    : "Add a new task to your todo list"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Title
                  </label>
                  <Input
                    placeholder="Enter todo title"
                    value={newTodo.title}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <Input
                    placeholder="Enter description (optional)"
                    value={newTodo.description}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Priority
                    </label>
                    <Select
                      value={newTodo.priority}
                      onValueChange={(value: any) =>
                        setNewTodo({ ...newTodo, priority: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Status
                    </label>
                    <Select
                      value={newTodo.status}
                      onValueChange={(value: any) =>
                        setNewTodo({ ...newTodo, status: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={newTodo.due_date}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, due_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Tags</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  {newTodo.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newTodo.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
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
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Add additional notes (optional)"
                    value={newTodo.notes}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, notes: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingTodo(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={createOrUpdateTodo}>
                  {editingTodo ? "Update Todo" : "Create Todo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">
                    No todos match your filters. Create your first todo!
                  </p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={openEditDialog}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {viewMode === "board" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(["not_started", "in_progress", "done"] as const).map((status) => (
            <div key={status} className="rounded-lg border p-4">
              <h3 className="mb-4 font-semibold capitalize">
                {status.replace("_", " ")}
              </h3>
              <div className="space-y-2">
                {groupedByStatus[status].map((todo) => (
                  <div
                    key={todo.id}
                    className={`group rounded-lg border p-3 transition-colors hover:bg-accent ${
                      todo.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                        className="mt-0.5"
                      >
                        {todo.completed ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4
                          className={`text-sm font-medium ${todo.completed ? "line-through" : ""}`}
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
                          onClick={() => openEditDialog(todo)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteTodo(todo.id)}
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
                      <button
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                      >
                        {todo.completed ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <div>
                        <p
                          className={`font-medium ${todo.completed ? "line-through" : ""}`}
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
                          onClick={() => deleteTodo(todo.id)}
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
    </div>
  );
}
