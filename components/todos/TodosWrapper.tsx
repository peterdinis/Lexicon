"use client";

import {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useOptimistic,
  useCallback,
} from "react";
import {
  Resolver,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  Check,
  Circle,
  GripVertical,
  LayoutList,
  TableIcon,
  Filter,
  TagIcon,
  X,
  Edit,
  Calendar,
  Clock,
  AlertCircle,
  Star,
  Flag,
  CheckCircle2,
  PlayCircle,
  CalendarDays,
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
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { z } from "zod";

// Zjednodušené typy
type TodoStatus = "not_started" | "in_progress" | "done";
type TodoPriority = "low" | "medium" | "high";

// Definice schématu
const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "done"]).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean | null;
  priority: TodoPriority | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  status: TodoStatus;
  tags?: string[];
  notes?: string;
};

type OptimisticTodo = Todo & { pending?: boolean };

type ViewMode = "list" | "board" | "table";
type FilterStatus = "all" | "not_started" | "in_progress" | "done";
type FilterPriority = "all" | "low" | "medium" | "high";

type OptimisticAction =
  | { type: "add"; todo: Todo }
  | { type: "update"; id: string; updates: Partial<Todo> }
  | { type: "delete"; id: string }
  | { type: "reorder"; todos: Todo[] }
  | { type: "toggle"; id: string; completed: boolean | null; status: TodoStatus };

// Constants
const PRIORITY_CONFIG = {
  high: {
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    icon: Flag,
    borderColor: "border-l-red-500 bg-red-50 dark:bg-red-950/20",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    icon: AlertCircle,
    borderColor: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  },
  low: {
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    icon: Star,
    borderColor: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
  },
  default: {
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
    icon: Circle,
    borderColor: "border-l-gray-500 bg-gray-50 dark:bg-gray-800",
  },
} as const;

const STATUS_CONFIG = {
  done: {
    color: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2,
  },
  in_progress: {
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
    icon: PlayCircle,
  },
  not_started: {
    color: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
    icon: Clock,
  },
  default: {
    color: "text-muted-foreground bg-muted",
    icon: Clock,
  },
} as const;

// Utility functions
const getPriorityConfig = (priority: string | null) => {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.default;
};

const getStatusConfig = (status: string | null) => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
};

const parseTags = (tags: string | string[] | null | undefined): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
};

// Helper funkcie pre boolean konverzie
const fromBoolean = (value: boolean | null): boolean => {
  return value === true;
};

// Form Types
type TodoFormData = {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  due_date?: string;
  status?: TodoStatus;
  tags?: string[];
  notes?: string;
};

// Sub-components
interface EmptyStateProps {
  onCreate: () => void;
}

function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <Card className="text-center py-12 border-dashed">
      <CardContent className="space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">No tasks found</h3>
          <p className="text-muted-foreground mt-1">
            Create your first task to get started!
          </p>
        </div>
        <Button onClick={onCreate} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </CardContent>
    </Card>
  );
}

interface TodoItemProps {
  todo: OptimisticTodo;
  onToggle: (todo: OptimisticTodo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: OptimisticTodo) => void;
  isBoard?: boolean;
}

function SortableTodoItemBase({ 
  todo, 
  onToggle, 
  onDelete, 
  onEdit, 
  isBoard = false 
}: TodoItemProps) {
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
    opacity: isDragging ? 0.5 : todo.pending ? 0.6 : 1,
  };

  const priorityConfig = getPriorityConfig(todo.priority);
  const statusConfig = getStatusConfig(todo.status);
  const PriorityIcon = priorityConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isCompleted = fromBoolean(todo.completed);

  if (isBoard) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50 ${
          isCompleted ? "opacity-70 bg-muted/50" : ""
        } ${isDragging ? "shadow-lg border-primary rotate-1 scale-105" : "border-border"} ${
          todo.pending ? "animate-pulse border-yellow-400" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(todo);
            }}
            className={`mt-0.5 shrink-0 rounded-full p-1.5 transition-colors ${
              isCompleted
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted-foreground/20"
            }`}
            disabled={todo.pending}
          >
            {isCompleted ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Circle className="h-3.5 w-3.5" />
            )}
          </button>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={`font-medium text-sm leading-tight ${
                  isCompleted
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                } ${todo.pending ? "text-muted-foreground" : ""}`}
              >
                {todo.title}
                {todo.pending && (
                  <span className="ml-2 text-xs text-yellow-600">
                    (saving...)
                  </span>
                )}
              </h4>
              <div className="flex items-center gap-1 shrink-0">
                <StatusIcon className="h-3 w-3" />
              </div>
            </div>

            {todo.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {todo.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              {todo.priority && (
                <Badge
                  variant="secondary"
                  className={`text-xs gap-1 ${priorityConfig.color}`}
                >
                  <PriorityIcon className="h-2.5 w-2.5" />
                  {todo.priority}
                </Badge>
              )}

              {todo.tags?.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs gap-1 bg-background"
                >
                  <TagIcon className="h-2.5 w-2.5" />
                  {tag}
                </Badge>
              ))}
              {todo.tags && todo.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{todo.tags.length - 2}
                </Badge>
              )}
            </div>

            {todo.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {format(new Date(todo.due_date), "MMM d")}
              </div>
            )}
          </div>
        </div>

        <div
          className={`absolute top-3 right-3 flex gap-1 transition-opacity ${
            todo.pending ? "opacity-50" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            disabled={todo.pending}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            disabled={todo.pending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-xl"
        />
      </div>
    );
  }

  // List view
  const borderColorClass = todo.priority 
    ? priorityConfig.borderColor 
    : "border-l-gray-500 bg-gray-50 dark:bg-gray-800";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-4 rounded-xl border-l-4 p-4 transition-all hover:shadow-md ${
        isCompleted ? "opacity-70 bg-muted/30" : ""
      } ${isDragging ? "shadow-lg border-primary scale-105" : "bg-card"} ${
        todo.pending ? "animate-pulse border-yellow-400" : borderColorClass
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing hover:bg-accent rounded-lg p-2 shrink-0 transition-colors"
        disabled={todo.pending}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        onClick={() => onToggle(todo)}
        className={`mt-1 shrink-0 rounded-full p-2 transition-colors ${
          isCompleted
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted-foreground/20"
        }`}
        disabled={todo.pending}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold leading-tight ${
                isCompleted
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              } ${todo.pending ? "text-muted-foreground" : ""}`}
            >
              {todo.title}
              {todo.pending && (
                <span className="ml-2 text-sm text-yellow-600">
                  (saving...)
                </span>
              )}
            </h3>
            {todo.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {todo.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {todo.priority && (
            <Badge variant="outline" className="gap-1.5 font-medium">
              <PriorityIcon className="h-3 w-3" />
              {todo.priority.toUpperCase()}
            </Badge>
          )}
          {todo.status && (
            <Badge
              variant="outline"
              className={`gap-1.5 ${statusConfig.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {todo.status.replace("_", " ").toUpperCase()}
            </Badge>
          )}
          {todo.tags && todo.tags.length > 0 && (
            <>
              {todo.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1.5">
                  <TagIcon className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </>
          )}
          {todo.due_date && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due: {format(new Date(todo.due_date), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex gap-1 ${todo.pending ? "opacity-50" : "opacity-0 group-hover:opacity-100"} transition-opacity shrink-0`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(todo)}
          disabled={todo.pending}
          className="rounded-lg"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(todo.id)}
          disabled={todo.pending}
          className="rounded-lg text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const SortableTodoItem = SortableTodoItemBase;
const BoardTodoItem = (props: TodoItemProps) => <SortableTodoItemBase {...props} isBoard />;

interface BoardColumnProps {
  status: TodoStatus;
  todos: OptimisticTodo[];
  onToggle: (todo: OptimisticTodo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: OptimisticTodo) => void;
}

function BoardColumn({ status, todos, onToggle, onDelete, onEdit }: BoardColumnProps) {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card key={status} className="rounded-xl" data-column-id={status}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
          <StatusIcon className="h-4 w-4" />
          {status.replace("_", " ")}
          <Badge variant="secondary" className="ml-auto">
            {todos.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <SortableContext
          items={todos.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[200px]">
            {todos.map((todo) => (
              <BoardTodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
            {todos.length === 0 && (
              <div
                className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center"
                data-column-id={status}
              >
                <Plus className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Drop tasks here</p>
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

interface TableRowProps {
  todo: OptimisticTodo;
  onToggle: (todo: OptimisticTodo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: OptimisticTodo) => void;
  isPending: boolean;
}

function TableRow({ todo, onToggle, onDelete, onEdit, isPending }: TableRowProps) {
  const isCompleted = fromBoolean(todo.completed);

  return (
    <tr
      className={`border-b transition-colors hover:bg-muted/30 ${
        todo.pending
          ? "animate-pulse bg-yellow-50 dark:bg-yellow-950/20"
          : ""
      }`}
    >
      <td className="p-4">
        <button
          onClick={() => onToggle(todo)}
          disabled={todo.pending || isPending}
          className={`rounded-full p-2 transition-colors ${
            isCompleted
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted-foreground/20"
          }`}
        >
          {isCompleted ? (
            <Check className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>
      </td>
      <td className="p-4">
        <div>
          <p
            className={`font-medium ${isCompleted ? "line-through" : ""} ${
              todo.pending ? "text-muted-foreground" : ""
            }`}
          >
            {todo.title}
            {todo.pending && (
              <span className="ml-2 text-xs text-yellow-600">
                (saving...)
              </span>
            )}
          </p>
          {todo.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {todo.description}
            </p>
          )}
        </div>
      </td>
      <td className="p-4">
        {todo.priority && (
          <Badge variant="outline" className="text-xs">
            {todo.priority}
          </Badge>
        )}
      </td>
      <td className="p-4">
        <div className="flex flex-wrap gap-1">
          {todo.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </td>
      <td className="p-4 text-sm">
        {todo.due_date
          ? format(new Date(todo.due_date), "MMM d, yyyy")
          : "-"}
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => onEdit(todo)}
            disabled={todo.pending || isPending}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
            onClick={() => onDelete(todo.id)}
            disabled={todo.pending || isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

interface TableViewProps {
  todos: OptimisticTodo[];
  onToggle: (todo: OptimisticTodo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: OptimisticTodo) => void;
  isPending: boolean;
}

function TableView({ todos, onToggle, onDelete, onEdit, isPending }: TableViewProps) {
  return (
    <Card className="rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left text-sm font-semibold">Status</th>
              <th className="p-4 text-left text-sm font-semibold">Title</th>
              <th className="p-4 text-left text-sm font-semibold">Priority</th>
              <th className="p-4 text-left text-sm font-semibold">Tags</th>
              <th className="p-4 text-left text-sm font-semibold">Due Date</th>
              <th className="p-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  <div className="space-y-2">
                    <p className="font-medium">No tasks found</p>
                    <p className="text-sm">
                      Create your first task to get started!
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              todos.map((todo) => (
                <TableRow
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  isPending={isPending}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface TodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  editingTodo: Todo | null;
  isPending: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSubmit: (data: TodoFormData) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onCancel: () => void;
}

function TodoDialog({
  open,
  onOpenChange,
  form,
  editingTodo,
  isPending,
  activeTab,
  onTabChange,
  onSubmit,
  onAddTag,
  onRemoveTag,
  onCancel,
}: TodoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {editingTodo ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {editingTodo
              ? "Update your task details and progress"
              : "Add a new task to your todo list"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="basic" className="rounded-lg">
              Basic
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-lg">
              Details
            </TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-lg">
              Advanced
            </TabsTrigger>
          </TabsList>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium mb-2 flex items-center gap-2"
                  >
                    <Circle className="h-4 w-4" />
                    Task Title *
                  </Label>
                  <Input
                    {...form.register("title")}
                    placeholder="What needs to be done?"
                    disabled={isPending}
                    className="rounded-lg"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium mb-2 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Description
                  </Label>
                  <Textarea
                    {...form.register("description")}
                    placeholder="Add more details about this task..."
                    rows={3}
                    disabled={isPending}
                    className="rounded-lg resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Priority
                  </Label>
                  <Select
                    value={form.watch("priority") || "medium"}
                    onValueChange={(v: TodoPriority) =>
                      form.setValue("priority", v)
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="low"
                        className="flex items-center gap-2"
                      >
                        <Star className="h-4 w-4 text-green-500" />
                        Low Priority
                      </SelectItem>
                      <SelectItem
                        value="medium"
                        className="flex items-center gap-2"
                      >
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        Medium Priority
                      </SelectItem>
                      <SelectItem
                        value="high"
                        className="flex items-center gap-2"
                      >
                        <Flag className="h-4 w-4 text-red-500" />
                        High Priority
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Status
                  </Label>
                  <Select
                    value={form.watch("status") || "not_started"}
                    onValueChange={(v: TodoStatus) => form.setValue("status", v)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="not_started"
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4 text-gray-500" />
                        Not Started
                      </SelectItem>
                      <SelectItem
                        value="in_progress"
                        className="flex items-center gap-2"
                      >
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                        In Progress
                      </SelectItem>
                      <SelectItem
                        value="done"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Done
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </Label>
                <Input
                  {...form.register("due_date")}
                  type="date"
                  placeholder="Select date"
                  disabled={isPending}
                  className="rounded-lg"
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tags to organize your tasks"
                    disabled
                    className="rounded-lg bg-muted"
                  />
                  <Button
                    type="button"
                    onClick={onAddTag}
                    disabled={isPending}
                    className="rounded-lg"
                  >
                    Add Tag
                  </Button>
                </div>
                {form.watch("tags") && form.watch("tags")!.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("tags")!.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 rounded-lg py-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => onRemoveTag(tag)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          disabled={isPending}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Additional Notes
                </Label>
                <Textarea
                  {...form.register("notes")}
                  placeholder="Any additional notes or comments..."
                  rows={4}
                  disabled={isPending}
                  className="rounded-lg resize-none"
                />
              </div>
            </TabsContent>

            <DialogFooter className="gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-primary hover:bg-primary/90"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingTodo ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingTodo ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Update Task
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Task
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface TodoSheetProps {
  todo: Todo | null;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  isPending: boolean;
}

function TodoSheet({ todo, onClose, onEdit, isPending }: TodoSheetProps) {
  if (!todo) return null;

  const statusConfig = getStatusConfig(todo.status);
  const priorityConfig = getPriorityConfig(todo.priority);
  const isCompleted = fromBoolean(todo.completed);

  return (
    <Sheet open={!!todo} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl rounded-l-2xl"
      >
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {todo.title}
              </SheetTitle>
              <SheetDescription className="mt-2 text-base">
                {todo.description || "No description provided"}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(todo)}
              className="shrink-0 mt-6 rounded-lg"
              disabled={isPending}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6 p-1">
          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Circle
                      className={`h-4 w-4 ${
                        isCompleted
                          ? "text-green-500 fill-green-500"
                          : todo.status === "in_progress"
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
                        text-sm px-3 py-1 ${
                          isCompleted
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : todo.status === "in_progress"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                        }
                        capitalize
                      `}
                    >
                      {isCompleted
                        ? "Completed"
                        : todo.status?.replace("_", " ") || "Not Started"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Priority
                  </p>
                  <Badge
                    variant="outline"
                    className={`
                      text-sm px-3 py-1 ${
                        todo.priority === "high"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : todo.priority === "medium"
                            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            : "bg-green-500/10 text-green-600 border-green-500/20"
                      }
                    capitalize
                  `}
                  >
                    {todo.priority || "Not set"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Due Date */}
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Due Date
                </p>
                <div className="flex items-center gap-2">
                  {todo.due_date ? (
                    <>
                      <Badge
                        variant="secondary"
                        className="font-normal text-sm px-3 py-1"
                      >
                        {format(
                          new Date(todo.due_date),
                          "MMM d, yyyy",
                        )}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(todo.due_date), "EEEE")}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No due date set
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-muted-foreground" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {todo.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1 text-sm font-medium gap-2"
                      >
                        <TagIcon className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {todo.notes && (
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Notes
                  </p>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {todo.notes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Task Information
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {format(
                        new Date(todo.created_at),
                        "MMM d, yyyy 'at' HH:mm",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Last Updated
                    </span>
                    <span className="font-medium">
                      {format(
                        new Date(todo.updated_at),
                        "MMM d, yyyy 'at' HH:mm",
                      )}
                    </span>
                  </div>
                  {todo.due_date && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Days Remaining
                      </span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(todo.due_date).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => onEdit(todo)}
            disabled={isPending}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Task
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
            disabled={isPending}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main Component
export default function TodoWrapper() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Opravený useOptimistic hook
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos as OptimisticTodo[],
    (state: OptimisticTodo[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [{ ...action.todo, pending: true }, ...state];
        case "update":
          return state.map((todo) =>
            todo.id === action.id
              ? { ...todo, ...action.updates, pending: true }
              : todo,
          );
        case "delete":
          return state.map((todo) =>
            todo.id === action.id ? { ...todo, pending: true } : todo,
          );
        case "toggle":
          return state.map((todo) =>
            todo.id === action.id
              ? {
                  ...todo,
                  completed: action.completed,
                  status: action.status,
                  pending: true,
                }
              : todo,
          );
        case "reorder":
          return action.todos.map((todo) => ({ ...todo, pending: false }));
        default:
          return state;
      }
    }
  );

  // Opravený useForm hook
  const form = useForm<TodoFormData>({
    resolver: zodResolver(createTodoSchema) as Resolver<TodoFormData>,
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "not_started",
      tags: [],
      notes: "",
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Data loading
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        const result = await getTodosAction();
        if (result.success && result.data) {
          setTodos(result.data as Todo[]);
        }
      } catch (error) {
        console.error("Failed to load todos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Memoized computations
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    todos.forEach((todo) => {
      todo.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return optimisticTodos.filter((todo) => {
      if (filterStatus !== "all" && todo.status !== filterStatus) return false;
      if (filterPriority !== "all" && todo.priority !== filterPriority)
        return false;
      if (filterTag !== "all" && !todo.tags?.includes(filterTag)) return false;
      return true;
    });
  }, [optimisticTodos, filterStatus, filterPriority, filterTag]);

  const groupedByStatus = useMemo(() => {
    return {
      not_started: filteredTodos.filter(
        (t) => t.status === "not_started" || !t.status,
      ),
      in_progress: filteredTodos.filter((t) => t.status === "in_progress"),
      done: filteredTodos.filter(
        (t) => t.status === "done" || fromBoolean(t.completed),
      ),
    };
  }, [filteredTodos]);

  // Event handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTodo = optimisticTodos.find((t) => t.id === active.id);
    if (!activeTodo) return;

    let targetStatus: TodoStatus = activeTodo.status || "not_started";

    const overTodo = optimisticTodos.find((t) => t.id === over.id);
    if (overTodo) {
      targetStatus = overTodo.status || "not_started";
    } else {
      const columnId = over.id as string;
      if (columnId.includes("not_started")) {
        targetStatus = "not_started";
      } else if (columnId.includes("in_progress")) {
        targetStatus = "in_progress";
      } else if (columnId.includes("done")) {
        targetStatus = "done";
      }
    }

    if (activeTodo.status !== targetStatus) {
      startTransition(async () => {
        const newCompleted = targetStatus === "done";

        setOptimisticTodos({
          type: "update",
          id: activeTodo.id,
          updates: {
            status: targetStatus,
            completed: newCompleted,
          },
        });

        const result = await updateTodoAction(activeTodo.id, {
          status: targetStatus,
          completed: newCompleted,
        });

        if (result.success) {
          setTodos((prev) =>
            prev.map((todo) =>
              todo.id === activeTodo.id
                ? {
                    ...todo,
                    status: targetStatus,
                    completed: newCompleted,
                  }
                : todo,
            ),
          );
        }
      });
    } else if (
      active.id !== over.id &&
      overTodo &&
      activeTodo.status === overTodo.status
    ) {
      const oldIndex = optimisticTodos.findIndex((t) => t.id === active.id);
      const newIndex = optimisticTodos.findIndex((t) => t.id === over.id);

      const newTodos = arrayMove(optimisticTodos, oldIndex, newIndex);
      setOptimisticTodos({ type: "reorder", todos: newTodos });
      setTodos(newTodos);
    }
  }, [optimisticTodos, setOptimisticTodos]);

  const handleSubmit = useCallback(async (data: TodoFormData) => {
    startTransition(async () => {
      try {
        if (editingTodo) {
          await handleUpdateTodo(editingTodo.id, data);
        } else {
          await handleCreateTodo(data);
        }
      } catch (error) {
        console.error("Failed to save todo:", error);
      }
    });
  }, [editingTodo]);

  const handleUpdateTodo = async (id: string, data: TodoFormData) => {
    const completed = data.status === "done";

    setOptimisticTodos({
      type: "update",
      id,
      updates: {
        title: data.title!,
        description: data.description || null,
        due_date: data.due_date || null,
        priority: data.priority,
        status: data.status || "not_started",
        tags: data.tags || [],
        notes: data.notes || "",
        completed,
      },
    });

    const updatedData = {
      title: data.title!,
      description: data.description ?? undefined,
      due_date: data.due_date || null,
      priority: data.priority,
      status: data.status || "not_started",
      tags: JSON.stringify(data.tags) as any,
      notes: data.notes || "",
      completed,
    };

    const result = await updateTodoAction(id, updatedData);

    if (result.success && result.data) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                ...updatedData,
                tags: data.tags || [],
                updated_at: new Date().toISOString(),
                completed,
              }
            : todo,
        ),
      );
      resetFormAndClose();
      router.refresh();
    }
  };

  const handleCreateTodo = async (data: TodoFormData) => {
    const tempId = `temp-${Date.now()}`;
    const completed = data.status === "done";

    const newTodo: Todo = {
      id: tempId,
      user_id: "",
      title: data.title!,
      description: data.description || null,
      due_date: data.due_date || null,
      priority: data.priority as unknown as TodoPriority,
      status: data.status || "not_started",
      tags: data.tags || [],
      notes: data.notes || "",
      completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setOptimisticTodos({ type: "add", todo: newTodo });

    const createData = {
      title: data.title!,
      description: data.description,
      priority: data.priority,
      due_date: data.due_date,
      status: data.status,
      tags: JSON.stringify(data.tags || []),
      notes: data.notes,
      completed,
    } as any;

    const result = await createTodoAction(createData);
    if (result.success && result.data) {
      const finalTodo: Todo = result.data as Todo;
      setTodos((prev) => [finalTodo, ...prev]);
      resetFormAndClose();
      router.refresh();
    }
  };

  const resetFormAndClose = () => {
    setDialogOpen(false);
    setEditingTodo(null);
    form.reset();
    setActiveTab("basic");
  };

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      startTransition(async () => {
        setOptimisticTodos({ type: "delete", id });

        const result = await deleteTodoAction(id);
        if (result.success) {
          setTodos((prev) => prev.filter((t) => t.id !== id));
          router.refresh();
        }
      });
    }
  }, [setOptimisticTodos, router]);

  const handleToggleComplete = useCallback(async (todo: OptimisticTodo) => {
    startTransition(async () => {
      const newCompleted = !fromBoolean(todo.completed);
      const newStatus: TodoStatus = newCompleted ? "done" : "not_started";

      setOptimisticTodos({
        type: "toggle",
        id: todo.id,
        completed: newCompleted,
        status: newStatus,
      });

      const result = await updateTodoAction(todo.id, {
        completed: newCompleted,
        status: newStatus,
      });

      if (result.success) {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === todo.id
              ? {
                  ...t,
                  completed: newCompleted,
                  status: newStatus,
                }
              : t,
          ),
        );
        router.refresh();
      }
    });
  }, [setOptimisticTodos, router]);

  const openEditDialog = useCallback((todo: OptimisticTodo) => {
    setEditingTodo(todo);
    form.reset({
      title: todo.title,
      description: todo.description ?? "",
      priority: todo.priority ?? "medium",
      due_date: todo.due_date ?? "",
      status: todo.status ?? "not_started",
      tags: todo.tags ?? [],
      notes: todo.notes ?? "",
    });
    setDialogOpen(true);
    setActiveTab("basic");
  }, [form]);

  const addTag = useCallback(() => {
    const tagInput = form.getValues("tags") || [];
    const newTag = prompt("Enter a new tag:");
    if (newTag && newTag.trim() && !tagInput.includes(newTag.trim())) {
      form.setValue("tags", [...tagInput, newTag.trim()]);
    }
  }, [form]);

  const removeTag = useCallback((tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  }, [form]);

  const openCreateDialog = useCallback(() => {
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
    setActiveTab("basic");
  }, [form]);

  const activeTodo = useMemo(() => 
    activeId ? optimisticTodos.find((todo) => todo.id === activeId) : null,
    [activeId, optimisticTodos]
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-muted-foreground mt-2">
              Organize your work and life
            </p>
          </div>
          <Button disabled className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground mt-1">
            {filteredTodos.length}{" "}
            {filteredTodos.length === 1 ? "task" : "tasks"}
            {filterStatus !== "all" && ` in ${filterStatus.replace("_", " ")}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              disabled={isPending}
              className="rounded-lg"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              disabled={isPending}
              className="rounded-lg"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filterStatus}
              onValueChange={(value: FilterStatus) => setFilterStatus(value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[140px] rounded-xl">
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
              onValueChange={(value: FilterPriority) =>
                setFilterPriority(value)
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-[140px] rounded-xl">
                <Flag className="mr-2 h-4 w-4" />
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
              <Select
                value={filterTag}
                onValueChange={setFilterTag}
                disabled={isPending}
              >
                <SelectTrigger className="w-[140px] rounded-xl">
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
              onClick={openCreateDialog}
              disabled={isPending}
              className="rounded-xl bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTodos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <EmptyState onCreate={openCreateDialog} />
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
          <DragOverlay>
            {activeTodo ? (
              <div className="rounded-xl border-l-4 border-l-primary bg-card p-4 shadow-lg opacity-80">
                <div className="flex items-start gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{activeTodo.title}</h3>
                    {activeTodo.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activeTodo.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Board View */}
      {viewMode === "board" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(["not_started", "in_progress", "done"] as const).map((status) => (
              <BoardColumn
                key={status}
                status={status}
                todos={groupedByStatus[status]}
                onToggle={handleToggleComplete}
                onDelete={handleDelete}
                onEdit={openEditDialog}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTodo ? (
              <div className="rounded-xl border bg-card p-3 shadow-lg border-primary opacity-80 rotate-1">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {fromBoolean(activeTodo.completed) ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">{activeTodo.title}</h4>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <TableView
          todos={filteredTodos}
          onToggle={handleToggleComplete}
          onDelete={handleDelete}
          onEdit={openEditDialog}
          isPending={isPending}
        />
      )}

      {/* Dialogs */}
      <TodoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        editingTodo={editingTodo}
        isPending={isPending}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSubmit={handleSubmit}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onCancel={resetFormAndClose}
      />

      <TodoSheet
        todo={selectedTodo}
        onClose={() => setSelectedTodo(null)}
        onEdit={openEditDialog}
        isPending={isPending}
      />
    </div>
  );
}