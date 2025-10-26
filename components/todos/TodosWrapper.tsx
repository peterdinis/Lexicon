"use client";

import { useState, useEffect, useMemo, useTransition, useOptimistic } from "react";
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

type OptimisticTodo = Todo & { pending?: boolean };

type ViewMode = "list" | "board" | "table";
type FilterStatus = "all" | "not_started" | "in_progress" | "done";
type FilterPriority = "all" | "low" | "medium" | "high";

type OptimisticAction = 
  | { type: "add"; todo: Todo }
  | { type: "update"; id: string; updates: Partial<Todo> }
  | { type: "delete"; id: string }
  | { type: "reorder"; todos: Todo[] }
  | { type: "toggle"; id: string; completed: number; status: string };


function BoardTodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: OptimisticTodo;
  onToggle: (todo: OptimisticTodo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: OptimisticTodo) => void;
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
    opacity: isDragging ? 0.5 : (todo.pending ? 0.6 : 1),
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case "high":
        return <Flag className="h-3 w-3" />;
      case "medium":
        return <AlertCircle className="h-3 w-3" />;
      case "low":
        return <Star className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50 ${
        (todo.completed ?? 0) === 1 ? "opacity-70 bg-muted/50" : ""
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
            (todo.completed ?? 0) === 1 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted-foreground/20"
          }`}
          disabled={todo.pending}
        >
          {(todo.completed ?? 0) === 1 ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Circle className="h-3.5 w-3.5" />
          )}
        </button>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-medium text-sm leading-tight ${
                (todo.completed ?? 0) === 1 ? "line-through text-muted-foreground" : "text-foreground"
              } ${todo.pending ? "text-muted-foreground" : ""}`}
            >
              {todo.title}
              {todo.pending && (
                <span className="ml-2 text-xs text-yellow-600">(saving...)</span>
              )}
            </h4>
            <div className="flex items-center gap-1 shrink-0">
              {getStatusIcon(todo.status)}
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
                className={`text-xs gap-1 ${getPriorityColor(todo.priority)}`}
              >
                {getPriorityIcon(todo.priority)}
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

      <div className={`absolute top-3 right-3 flex gap-1 transition-opacity ${
        todo.pending ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
      }`}>
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

function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: OptimisticTodo;
  onToggle: (todo: OptimisticTodo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: OptimisticTodo) => void;
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
    opacity: isDragging ? 0.5 : (todo.pending ? 0.6 : 1),
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      case "low":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/20";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-800";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "done":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "in_progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
      case "not_started":
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress":
        return <PlayCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-4 rounded-xl border-l-4 p-4 transition-all hover:shadow-md ${
        (todo.completed ?? 0) === 1 ? "opacity-70 bg-muted/30" : ""
      } ${isDragging ? "shadow-lg border-primary scale-105" : "bg-card"} ${
        todo.pending ? "animate-pulse border-yellow-400" : getPriorityColor(todo.priority)
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
          (todo.completed ?? 0) === 1 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted hover:bg-muted-foreground/20"
        }`}
        disabled={todo.pending}
      >
        {(todo.completed ?? 0) === 1 ? (
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
                (todo.completed ?? 0) === 1 ? "line-through text-muted-foreground" : "text-foreground"
              } ${todo.pending ? "text-muted-foreground" : ""}`}
            >
              {todo.title}
              {todo.pending && (
                <span className="ml-2 text-sm text-yellow-600">(saving...)</span>
              )}
            </h3>
            {todo.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {todo.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {getStatusIcon(todo.status)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {todo.priority && (
            <Badge
              variant="outline"
              className="gap-1.5 font-medium"
            >
              <Flag className="h-3 w-3" />
              {todo.priority.toUpperCase()}
            </Badge>
          )}
          {todo.status && (
            <Badge variant="outline" className={`gap-1.5 ${getStatusColor(todo.status)}`}>
              {getStatusIcon(todo.status)}
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

      <div className={`flex gap-1 ${todo.pending ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'} transition-opacity shrink-0`}>
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

export default function TodoWrapper() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [todos, setTodos] = useState<Todo[]>([]);
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

  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos as OptimisticTodo[],
    (state: OptimisticTodo[], action: OptimisticAction): OptimisticTodo[] => {
      switch (action.type) {
        case "add":
          return [{ ...action.todo, pending: true }, ...state];
        
        case "update":
          return state.map(todo =>
            todo.id === action.id
              ? { ...todo, ...action.updates, pending: true }
              : todo
          );
        
        case "delete":
          return state.map(todo =>
            todo.id === action.id
              ? { ...todo, pending: true }
              : todo
          );
        
        case "toggle":
          return state.map(todo =>
            todo.id === action.id
              ? { 
                  ...todo, 
                  completed: action.completed, 
                  status: action.status,
                  pending: true 
                }
              : todo
          );
        
        case "reorder":
          return action.todos.map(todo => ({ ...todo, pending: false }));
        
        default:
          return state;
      }
    }
  );

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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
              tags: todo.tags 
                ? typeof todo.tags === 'string' 
                  ? JSON.parse(todo.tags) 
                  : todo.tags
                : [],
              completed: todo.completed ?? 0,
              notes: todo.notes ?? "",
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
    return optimisticTodos.filter((todo) => {
      if (filterStatus !== "all" && todo.status !== filterStatus) return false;
      if (filterPriority !== "all" && todo.priority !== filterPriority)
        return false;
      if (filterTag !== "all" && !todo.tags?.includes(filterTag)) return false;
      return true;
    });
  }, [optimisticTodos, filterStatus, filterPriority, filterTag]);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTodo = optimisticTodos.find(t => t.id === active.id);
    
    if (!activeTodo) return;

    let targetStatus: any;

    const overTodo = optimisticTodos.find(t => t.id === over.id);
    if (overTodo) {
      targetStatus = overTodo.status || 'not_started';
    } else {
      const columnId = over.id as string;
      if (columnId.includes('not_started') || columnId === 'not_started') {
        targetStatus = 'not_started';
      } else if (columnId.includes('in_progress') || columnId === 'in_progress') {
        targetStatus = 'in_progress';
      } else if (columnId.includes('done') || columnId === 'done') {
        targetStatus = 'done';
      } else {
        targetStatus = activeTodo.status || 'not_started';
      }
    }

    if (activeTodo.status !== targetStatus) {
      startTransition(async () => {
        setOptimisticTodos({ 
          type: "update", 
          id: activeTodo.id, 
          updates: { 
            status: targetStatus, 
            completed: targetStatus === 'done' ? 1 : 0 
          } 
        });

        const result = await updateTodoAction(activeTodo.id, {
          status: targetStatus,
          completed: targetStatus === 'done' ? 1 : 0,
        });

        if (result.success) {
          setTodos(prev =>
            prev.map(todo =>
              todo.id === activeTodo.id
                ? { 
                    ...todo, 
                    status: targetStatus, 
                    completed: targetStatus === 'done' ? 1 : 0 
                  }
                : todo
            )
          );
        }
      });
    } 

    else if (active.id !== over.id && overTodo && activeTodo.status === overTodo.status) {
      const oldIndex = optimisticTodos.findIndex((t) => t.id === active.id);
      const newIndex = optimisticTodos.findIndex((t) => t.id === over.id);

      const newTodos = arrayMove(optimisticTodos, oldIndex, newIndex);
      setOptimisticTodos({ type: "reorder", todos: newTodos });
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
    startTransition(async () => {
      try {
        if (editingTodo) {
          setOptimisticTodos({
            type: "update",
            id: editingTodo.id,
            updates: {
              title: data.title,
              description: data.description || null,
              due_date: data.due_date || null,
              priority: data.priority,
              status: data.status || "not_started",
              tags: data.tags || [],
              notes: data.notes || "",
            }
          });

          const updatedData: any = {
            title: data.title,
            description: data.description || null,
            due_date: data.due_date || null,
            priority: data.priority,
            status: data.status || "not_started",
            tags: data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : JSON.stringify([]),
            notes: data.notes || "",
          };
          
          const result = await updateTodoAction(editingTodo.id, updatedData);
          
          if (result.success && result.data) {
            setTodos((prev) =>
              prev.map((todo) =>
                todo.id === editingTodo.id
                  ? {
                      ...todo,
                      title: data.title,
                      description: data.description || null,
                      due_date: data.due_date || null,
                      priority: data.priority,
                      status: data.status || "not_started",
                      tags: data.tags || [],
                      notes: data.notes || "",
                      updated_at: new Date().toISOString(),
                    }
                  : todo,
              ),
            );
            setDialogOpen(false);
            setEditingTodo(null);
            form.reset();
            setActiveTab("basic");
            router.refresh();
          }
        } else {
          const tempId = `temp-${Date.now()}`;
          const newTodo: Todo = {
            id: tempId,
            user_id: "",
            title: data.title,
            description: data.description || null,
            due_date: data.due_date || null,
            priority: data.priority,
            status: data.status || "not_started",
            tags: data.tags || [],
            notes: data.notes || "",
            completed: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setOptimisticTodos({ type: "add", todo: newTodo });

          const createData = {
            ...data,
            tags: data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : JSON.stringify([]),
          };

          const result = await createTodoAction(createData);
          if (result.success && result.data) {
            const finalTodo: Todo = {
              ...result.data,
              description: result.data.description ?? null,
              due_date: result.data.due_date ?? null,
              status: data.status ?? "not_started",
              tags: data.tags ?? [],
              notes: data.notes ?? "",
            };
            setTodos((prev) => [finalTodo, ...prev]);
            setDialogOpen(false);
            setEditingTodo(null);
            form.reset();
            setActiveTab("basic");
            router.refresh();
          }
        }
      } catch (error) {
        console.error("Failed to save todo:", error);
      }
    });
  };

  const handleDelete = async (id: string) => {
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
  };

  const handleToggleComplete = async (todo: OptimisticTodo) => {
    startTransition(async () => {
      const newCompleted = (todo.completed ?? 0) === 1 ? 0 : 1;
      const newStatus = newCompleted === 1 ? "done" : "not_started";
      
      setOptimisticTodos({ 
        type: "toggle", 
        id: todo.id, 
        completed: newCompleted, 
        status: newStatus 
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
  };

  const openEditDialog = (todo: OptimisticTodo) => {
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
    setActiveTab("basic");
  };

  const addTag = () => {
    const tagInput = form.getValues("tags") || [];
    const newTag = prompt("Enter a new tag:");
    if (newTag && newTag.trim() && !tagInput.includes(newTag.trim())) {
      form.setValue("tags", [...tagInput, newTag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const activeTodo = activeId ? optimisticTodos.find(todo => todo.id === activeId) : null;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              My Tasks
            </h1>
            <p className="text-muted-foreground mt-2">Organize your work and life</p>
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'} 
            {filterStatus !== 'all' && ` in ${filterStatus.replace('_', ' ')}`}
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
              onValueChange={(value: FilterPriority) => setFilterPriority(value)}
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
              <Select value={filterTag} onValueChange={setFilterTag} disabled={isPending}>
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
                setActiveTab("basic");
              }}
              disabled={isPending}
              className="rounded-xl bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

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
                <Card className="text-center py-12 border-dashed">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">No tasks found</h3>
                      <p className="text-muted-foreground mt-1">
                        {Object.keys(filteredTodos).length === 0 
                          ? "Create your first task to get started!" 
                          : "No tasks match your current filters"}
                      </p>
                    </div>
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
                      className="rounded-xl"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Task
                    </Button>
                  </CardContent>
                </Card>
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

      {viewMode === "board" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(["not_started", "in_progress", "done"] as const).map((status) => (
              <Card 
                key={status} 
                className="rounded-xl"
                data-column-id={status}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                    {status === "not_started" && <Clock className="h-4 w-4 text-gray-500" />}
                    {status === "in_progress" && <PlayCircle className="h-4 w-4 text-blue-500" />}
                    {status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {status.replace("_", " ")} 
                    <Badge variant="secondary" className="ml-auto">
                      {groupedByStatus[status].length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <SortableContext
                    items={groupedByStatus[status].map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[200px]">
                      {groupedByStatus[status].map((todo) => (
                        <BoardTodoItem
                          key={todo.id}
                          todo={todo}
                          onToggle={handleToggleComplete}
                          onDelete={handleDelete}
                          onEdit={openEditDialog}
                        />
                      ))}
                      {groupedByStatus[status].length === 0 && (
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
            ))}
          </div>
          <DragOverlay>
            {activeTodo ? (
              <div className="rounded-xl border bg-card p-3 shadow-lg border-primary opacity-80 rotate-1">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {(activeTodo.completed ?? 0) === 1 ? (
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
      
      {viewMode === "table" && (
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
                {filteredTodos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      <div className="space-y-2">
                        <p className="font-medium">No tasks found</p>
                        <p className="text-sm">
                          {Object.keys(filteredTodos).length === 0 
                            ? "Create your first task to get started!" 
                            : "No tasks match your current filters"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTodos.map((todo) => (
                    <tr
                      key={todo.id}
                      className={`border-b transition-colors hover:bg-muted/30 ${
                        todo.pending ? 'animate-pulse bg-yellow-50 dark:bg-yellow-950/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggleComplete(todo)} 
                          disabled={todo.pending}
                          className={`rounded-full p-2 transition-colors ${
                            (todo.completed ?? 0) === 1 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted hover:bg-muted-foreground/20"
                          }`}
                        >
                          {(todo.completed ?? 0) === 1 ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div>
                          <p
                            className={`font-medium ${(todo.completed ?? 0) === 1 ? "line-through" : ""} ${
                              todo.pending ? "text-muted-foreground" : ""
                            }`}
                          >
                            {todo.title}
                            {todo.pending && (
                              <span className="ml-2 text-xs text-yellow-600">(saving...)</span>
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
                            onClick={() => openEditDialog(todo)}
                            disabled={todo.pending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                            onClick={() => handleDelete(todo.id)}
                            disabled={todo.pending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {editingTodo ? "Edit Task" : "Create New Task"}
            </DialogTitle>
            <DialogDescription>
              {editingTodo
                ? "Update your task details and progress"
                : "Add a new task to your todo list"}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl">
              <TabsTrigger value="basic" className="rounded-lg">Basic</TabsTrigger>
              <TabsTrigger value="details" className="rounded-lg">Details</TabsTrigger>
              <TabsTrigger value="advanced" className="rounded-lg">Advanced</TabsTrigger>
            </TabsList>
            
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium mb-2 flex items-center gap-2">
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
                    <Label htmlFor="description" className="text-sm font-medium mb-2 flex items-center gap-2">
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
                      value={form.watch("priority")}
                      onValueChange={(v: "low" | "medium" | "high") =>
                        form.setValue("priority", v)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-500" />
                          Low Priority
                        </SelectItem>
                        <SelectItem value="medium" className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          Medium Priority
                        </SelectItem>
                        <SelectItem value="high" className="flex items-center gap-2">
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
                      value={form.watch("status")}
                      onValueChange={(v: "not_started" | "in_progress" | "done") =>
                        form.setValue("status", v)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          Not Started
                        </SelectItem>
                        <SelectItem value="in_progress" className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-blue-500" />
                          In Progress
                        </SelectItem>
                        <SelectItem value="done" className="flex items-center gap-2">
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
                    <Button type="button" onClick={addTag} disabled={isPending} className="rounded-lg">
                      Add Tag
                    </Button>
                  </div>
                  {form.watch("tags") && form.watch("tags")!.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("tags")!.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 rounded-lg py-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
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
                  <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
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
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingTodo(null);
                    setActiveTab("basic");
                  }}
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
      
      <Sheet open={!!selectedTodo} onOpenChange={() => setSelectedTodo(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl rounded-l-2xl">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-2xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
                className="shrink-0 mt-6 rounded-lg"
                disabled={isPending}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {selectedTodo && (
            <div className="mt-6 space-y-6 p-1">
              {/* Status & Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Circle
                          className={`h-4 w-4 ${
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
                            text-sm px-3 py-1 ${
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
                      {selectedTodo.due_date ? (
                        <>
                          <Badge variant="secondary" className="font-normal text-sm px-3 py-1">
                            {format(new Date(selectedTodo.due_date), "MMM d, yyyy")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
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
                </CardContent>
              </Card>

              {/* Tags */}
              {selectedTodo.tags && selectedTodo.tags.length > 0 && (
                <Card className="rounded-xl">
                  <CardContent className="p-4">
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
              {selectedTodo.notes && (
                <Card className="rounded-xl">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Notes</p>
                      <div className="rounded-lg border bg-muted/20 p-4">
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedTodo.notes}
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
                            new Date(selectedTodo.created_at),
                            "MMM d, yyyy 'at' HH:mm",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium">
                          {format(
                            new Date(selectedTodo.updated_at),
                            "MMM d, yyyy 'at' HH:mm",
                          )}
                        </span>
                      </div>
                      {selectedTodo.due_date && (
                        <div className="flex justify-between items-center text-sm">
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
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
              disabled={isPending}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedTodo(null)}
              className="flex-1 rounded-xl"
              disabled={isPending}
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}