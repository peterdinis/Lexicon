"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Trash2,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Home,
  Settings,
  PanelLeftClose,
  PanelLeft,
  CheckSquare,
  Calendar,
  Folder,
  FolderPlus,
  MoreHorizontal,
  GripVertical,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  useDraggable,
  useDroppable,
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Page } from "@/types/applicationTypes";
import {
  createPageAction,
  deletePageAction,
  getAllPagesAction,
} from "@/actions/pagesActions";
import { createFolderAction, getFoldersAction } from "@/actions/folderActions";
import { debounce } from "@/lib/debounce";

interface DashboardSidebarProps {
  initialPages: Page[];
  currentPageId?: string;
}

export function DashboardSidebar({
  initialPages,
  currentPageId,
}: DashboardSidebarProps) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, setOverId] = useState<string | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderParentId, setFolderParentId] = useState<string | null>(null);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const refreshPagesAndFolders = useCallback(async () => {
    try {
      const [pagesResult, foldersResult] = await Promise.all([
        getAllPagesAction(),
        getFoldersAction(),
      ]);

      if (!pagesResult?.data) throw new Error("No pages returned");
      if (!foldersResult) throw new Error("No folders returned");

      const folderPages = foldersResult.data!.map((f: any) => ({
        id: f.id,
        title: f.title,
        icon: "",
        parent_id: f.parent_id,
        is_folder: 0,
        user_id: "",
        description: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      setPages([...pagesResult.data, ...folderPages]);
    } catch (err) {
      console.error("Failed to fetch pages/folders:", err);
    }
  }, []);

  useEffect(() => {
    refreshPagesAndFolders();
  }, [refreshPagesAndFolders]);

  const buildHierarchy = useCallback((pages: Page[]): Page[] => {
    const pageMap = new Map<string, Page & { children?: Page[] }>();
    const rootPages: Page[] = [];
    pages.forEach((p) => pageMap.set(p.id, { ...p, children: [] }));
    pages.forEach((p) => {
      const pageWithChildren = pageMap.get(p.id)!;
      if (p.parent_id && pageMap.has(p.parent_id)) {
        pageMap.get(p.parent_id)!.children!.push(pageWithChildren);
      } else rootPages.push(pageWithChildren);
    });
    return rootPages;
  }, []);

  const hierarchicalPages = useMemo(
    () => buildHierarchy(pages),
    [pages, buildHierarchy],
  );

  const createPage = async () => {
    setLoading(true);
    try {
      const result = await createPageAction({
        title: "Untitled",
        description: "",
      });
      if (!result?.data) throw new Error("No data returned from server");
      router.push(`/page/${result.data.id}`);
      setMobileOpen(false);
      await refreshPagesAndFolders();
    } catch (error) {
      console.error("Error creating page:", error);
      alert(
        `Failed to create page: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const createFolder = (parentId?: string | null) => {
    setFolderParentId(parentId || null);
    setNewFolderName("");
    setFolderModalOpen(true);
  };

  const handleFolderSubmit = async () => {
    if (!newFolderName.trim()) return;
    setLoading(true);
    try {
      await createFolderAction({
        title: newFolderName,
        parent_id: folderParentId,
      });
      await refreshPagesAndFolders();
      setFolderModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to move this to trash?")) return;

    const prevPages = [...pages];
    setPages((prev) => prev.filter((p) => p.id !== id));

    try {
      const result = await deletePageAction({ id });
      if (!result?.data) throw new Error("Failed to delete page");

      if (currentPageId === id) router.push("/");
    } catch (error) {
      console.error(error);
      setPages(prevPages);
      alert(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const movePage = async (pageId: string, targetFolderId: string | null) => {
    const prevPages = [...pages];
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, parent_id: targetFolderId } : p,
      ),
    );
    try {
      const response = await fetch(`/api/pages/${pageId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: targetFolderId }),
      });
      if (!response.ok) throw new Error("Failed to move page");
    } catch (error) {
      console.error(error);
      setPages(prevPages);
    }
  };

  const movePageDebounced = useMemo(() => debounce(movePage, 300), [pages]);

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(event.active.id as string);
  const handleDragOver = (event: DragOverEvent) =>
    setOverId((event.over?.id as string) || null);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over || active.id === over.id) return;

    const draggedPageId = active.id as string;
    const targetId = over.id as string;

    const draggedPage = pages.find((p) => p.id === draggedPageId);
    if (draggedPage?.is_folder && targetId === draggedPageId) return;

    if (targetId === "root") movePageDebounced(draggedPageId, null);
    else {
      const targetPage = pages.find((p) => p.id === targetId);
      if (targetPage?.is_folder) {
        movePageDebounced(draggedPageId, targetId);
        setExpandedFolders((prev) => new Set([...prev, targetId]));
      }
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) newSet.delete(folderId);
      else newSet.add(folderId);
      return newSet;
    });
  };

  const isDescendant = (parentId: string, childId: string) => {
    const page = pages.find((p) => p.id === childId);
    if (!page || !page.parent_id) return false;
    if (page.parent_id === parentId) return true;
    return isDescendant(parentId, page.parent_id);
  };

  const DraggablePageItem = memo(
    ({
      page,
      depth = 0,
    }: {
      page: Page & { children?: Page[] };
      depth?: number;
    }) => {
      const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: page.id, data: { page } });
      const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      };
      return (
        <div ref={setNodeRef} style={style}>
          <PageTreeItem
            page={page}
            depth={depth}
            dragHandleProps={{ attributes, listeners }}
          />
        </div>
      );
    },
  );

  const DroppableFolder = ({
    page,
    depth = 0,
    children,
  }: {
    page: Page & { children?: Page[] };
    depth?: number;
    children: ReactNode;
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: page.id,
      data: { page },
    });
    const isValidDrop =
      activeId && activeId !== page.id && !isDescendant(page.id, activeId);
    return (
      <div
        ref={setNodeRef}
        className={`rounded-lg transition-colors ${
          isOver && isValidDrop ? "bg-primary/10 ring-2 ring-primary/50" : ""
        }`}
      >
        {children}
      </div>
    );
  };

  const PageTreeItem = memo(
    ({
      page,
      depth = 0,
      dragHandleProps,
    }: {
      page: Page & { children?: Page[] };
      depth?: number;
      dragHandleProps?: {
        attributes: DraggableAttributes;
        listeners: DraggableSyntheticListeners;
      };
    }) => {
      const isExpanded = expandedFolders.has(page.id);
      const hasChildren = page.children && page.children.length > 0;

      const content = (
        <div
          className={`group flex items-center gap-1 rounded-lg transition-colors hover:bg-accent ${
            currentPageId === page.id ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          <button
            {...dragHandleProps}
            className="cursor-grab p-1 opacity-0 transition-opacity hover:bg-accent-foreground/10 rounded group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {page.is_folder ? (
            <>
              <button
                onClick={() => toggleFolder(page.id)}
                className="p-1 hover:bg-accent-foreground/10 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                className="flex flex-1 items-center gap-2 py-1.5 text-sm"
                onClick={() => {
                  router.push(`/page/${page.id}`);
                  setMobileOpen(false);
                }}
              >
                <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-left">
                  {page.icon} {page.title}
                </span>
              </button>
            </>
          ) : (
            <>
              <div className="w-5" />
              <button
                className="flex flex-1 items-center gap-2 py-1.5 text-sm"
                onClick={() => {
                  router.push(`/page/${page.id}`);
                  setMobileOpen(false);
                }}
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-left">
                  {page.icon} {page.title}
                </span>
              </button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 p-1 transition-opacity hover:bg-accent-foreground/10 rounded group-hover:opacity-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {page.is_folder && (
                <>
                  <DropdownMenuItem onClick={() => createPage()}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => createFolder(page.id)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                  deletePage(page.id, e)
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );

      return (
        <div>
          {page.is_folder ? (
            <DroppableFolder page={page} depth={depth}>
              {content}
            </DroppableFolder>
          ) : (
            content
          )}
          {page.is_folder && isExpanded && hasChildren && (
            <div>
              {page.children!.map((child: Page) => (
                <DraggablePageItem
                  key={child.id}
                  page={child}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      );
    },
  );

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const { setNodeRef: setRootRef, isOver: isOverRoot } = useDroppable({
      id: "root",
    });

    return (
      <div className="flex h-full flex-col">
        {!isMobile && (
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Workspace</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="h-8 w-8"
            >
              {desktopCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {/* Workspace shortcuts */}
            <div className="mb-2">
              <button
                onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {workspaceExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Workspace
              </button>
              {workspaceExpanded && (
                <div className="ml-2 mt-1 space-y-1">
                  <button
                    onClick={() => {
                      router.push("/dashboard");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Home className="h-4 w-4 text-muted-foreground" />
                    Home
                  </button>
                  <button
                    onClick={() => {
                      router.push("/todos");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    Todos
                  </button>
                  <button
                    onClick={() => {
                      router.push("/diagrams");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <ChartNoAxesColumnIncreasing className="h-4 w-4 text-muted-foreground" />
                    Diagrams
                  </button>
                  <button
                    onClick={() => {
                      router.push("/calendar");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Calendar
                  </button>
                  <button
                    onClick={() => {
                      router.push("/settings");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      router.push("/trash");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                    Trash
                  </button>
                </div>
              )}
            </div>

            {/* Pages */}
            <div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <button
                  onClick={() => setPagesExpanded(!pagesExpanded)}
                  className="flex flex-1 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent-foreground"
                >
                  {pagesExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  Pages
                </button>
                <div className="flex gap-1">
                  <Button
                    onClick={() => createFolder()}
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => createPage()}
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {pagesExpanded && (
                <div
                  ref={setRootRef}
                  className={`mt-1 space-y-0.5 rounded-lg p-1 transition-colors ${
                    isOverRoot && activeId
                      ? "bg-primary/10 ring-2 ring-primary/50"
                      : ""
                  }`}
                >
                  {hierarchicalPages.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                      No pages yet. Create your first page!
                    </div>
                  ) : (
                    hierarchicalPages.map((page) => (
                      <DraggablePageItem key={page.id} page={page} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const activePage = activeId ? pages.find((p) => p.id === activeId) : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <aside
          className={`hidden border-r bg-muted/30 transition-all duration-300 md:block ${
            desktopCollapsed ? "w-0 overflow-hidden" : "w-64"
          }`}
        >
          <SidebarContent />
        </aside>

        <DragOverlay>
          {activePage ? (
            <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 shadow-lg ring-2 ring-primary">
              {activePage.is_folder ? (
                <Folder className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="truncate">{activePage.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      {/* Folder modal */}
      <Sheet open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <SheetContent side="right" className="max-w-md">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">New Folder</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFolderModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setFolderModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleFolderSubmit} disabled={loading}>
                Create
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
