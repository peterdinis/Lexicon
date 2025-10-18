"use client";

import { useState } from "react";
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
import { createPageAction } from "@/actions/pagesActions";

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
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const buildHierarchy = (pages: Page[]): Page[] => {
    const pageMap = new Map<string, Page & { children?: Page[] }>();
    const rootPages: Page[] = [];

    pages.forEach((page) => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    pages.forEach((page) => {
      const pageWithChildren = pageMap.get(page.id)!;
      if (page.parent_id && pageMap.has(page.parent_id)) {
        const parent = pageMap.get(page.parent_id)!;
        parent.children!.push(pageWithChildren);
      } else {
        rootPages.push(pageWithChildren);
      }
    });

    return rootPages;
  };

    const createPage = () => {
    setLoading(true);
    
    createPageAction({
      title: "Untitled",
      description: "",
    })
      .then((result) => {
        if (result?.serverError) {
          throw new Error(result.serverError);
        }

        if (!result?.data) {
          throw new Error("No data returned from server");
        }

        const newPage: Page = result.data;
        setPages([newPage, ...pages]);
        router.push(`/page/${newPage.id}`);
        setMobileOpen(false);
      })
      .catch((error) => {
        console.error("Error creating page:", error);
        alert(`Failed to create page: ${error instanceof Error ? error.message : 'Unknown error'}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createFolder = async (parentId?: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Folder",
          is_folder: true,
          parent_id: parentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      const newFolder = await response.json();
      setPages([newFolder, ...pages]);
      setExpandedFolders(new Set([...expandedFolders, newFolder.id]));
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const movePage = async (pageId: string, targetFolderId: string | null) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: targetFolderId }),
      });

      if (!response.ok) throw new Error("Failed to move page");

      const updatedPage = await response.json();
      setPages(pages.map((p) => (p.id === pageId ? updatedPage : p)));
    } catch (error) {
      console.error("Error moving page:", error);
    }
  };

  const deletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to move this to trash?")) return;

    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete page");

      setPages(pages.filter((p) => p.id !== id));

      if (currentPageId === id) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const isDescendant = (parentId: string, childId: string): boolean => {
    const page = pages.find((p) => p.id === childId);
    if (!page || !page.parent_id) return false;
    if (page.parent_id === parentId) return true;
    return isDescendant(parentId, page.parent_id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const draggedPageId = active.id as string;
    const targetId = over.id as string;

    // Prevent dropping a folder into itself or its descendants
    const draggedPage = pages.find((p) => p.id === draggedPageId);
    if (
      draggedPage?.is_folder &&
      (targetId === draggedPageId || isDescendant(draggedPageId, targetId))
    ) {
      return;
    }

    // If dropping on root, set parent to null
    if (targetId === "root") {
      movePage(draggedPageId, null);
      return;
    }

    // If dropping on a folder, set that folder as parent
    const targetPage = pages.find((p) => p.id === targetId);
    if (targetPage?.is_folder) {
      movePage(draggedPageId, targetId);
      // Auto-expand the folder
      setExpandedFolders(new Set([...expandedFolders, targetId]));
    }
  };

  const DraggablePageItem = ({
    page,
    depth = 0,
  }: {
    page: Page & { children?: Page[] };
    depth?: number;
  }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: page.id,
        data: { page },
      });

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
  };

  const DroppableFolder = ({
    page,
    depth = 0,
    children,
  }: {
    page: Page & { children?: Page[] };
    depth?: number;
    children: React.ReactNode;
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
        className={`rounded-lg transition-colors ${isOver && isValidDrop ? "bg-primary/10 ring-2 ring-primary/50" : ""
          }`}
      >
        {children}
      </div>
    );
  };

  const PageTreeItem = ({
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
        className={`group flex items-center gap-1 rounded-lg transition-colors hover:bg-accent ${currentPageId === page.id ? "bg-accent" : ""
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
              onClick={() => {
                if (!page.is_folder) {
                  router.push(`/page/${page.id}`);
                  setMobileOpen(false);
                }
              }}
              className="flex flex-1 items-center gap-2 py-1.5 text-sm"
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
              onClick={() => {
                router.push(`/page/${page.id}`);
                setMobileOpen(false);
              }}
              className="flex flex-1 items-center gap-2 py-1.5 text-sm"
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
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const hierarchicalPages = buildHierarchy(pages);
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
                      router.push("/");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/todos");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Todos</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/calendar");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Calendar</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/diagrams");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <span>Diagrams</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/settings");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/trash");
                      if (isMobile) setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                    <span>Trash</span>
                  </button>
                </div>
              )}
            </div>

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
                  className={`mt-1 space-y-0.5 rounded-lg p-1 transition-colors ${isOverRoot && activeId
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
          className={`hidden border-r bg-muted/30 transition-all duration-300 md:block ${desktopCollapsed ? "w-0 overflow-hidden" : "w-64"
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
              <span className="text-sm">
                {activePage.icon} {activePage.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {desktopCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDesktopCollapsed(false)}
          className="fixed left-4 top-4 z-50 hidden md:flex"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>
    </>
  );
}
