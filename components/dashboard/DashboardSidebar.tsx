"use client";

import { useState, useMemo, useCallback, memo, ReactNode, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeft,
  CheckSquare,
  Calendar,
  Folder,
  FolderPlus,
  MoreHorizontal,
  GripVertical,
  ChartNoAxesColumnIncreasing,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
import { createPageAction, getAllPagesAction, movePageAction } from "@/actions/pagesActions";
import { createFolderAction } from "@/actions/folderActions";
import { debounce } from "@/lib/debounce";
import { moveToTrashAction } from "@/actions/trashActions";

interface DashboardSidebarProps {
  initialPages: any[];
  currentPageId?: string;
}

export function DashboardSidebar({
  initialPages,
  currentPageId,
}: DashboardSidebarProps) {
  const [pages, setPages] = useState<Page[]>(
    initialPages.filter(p => p.in_trash === 0)
  );
  const [loading, setLoading] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, setOverId] = useState<string | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderParentId, setFolderParentId] = useState<string | null>(null);

  const router = useRouter();

  // Načítanie všetkých dát zo servera
  const loadAllData = useCallback(async () => {
    setLoadingPages(true);
    try {
      const pagesResult = await getAllPagesAction() as any;
      if (pagesResult?.data) {
        const allPages = pagesResult.data.filter((p: Page) => p.in_trash === 0);
        setPages(allPages);
        console.log("Loaded pages:", allPages);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingPages(false);
    }
  }, []);

  // Načítaj dáta pri prvom renderi
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Synchronizuj s initialPages
  useEffect(() => {
    setPages(initialPages.filter(p => p.in_trash === 0));
  }, [initialPages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const buildHierarchy = useCallback((pages: Page[]): any[] => {
    const pageMap = new Map<string, any>();
    const rootPages: any[] = [];

    pages.forEach((p) => pageMap.set(p.id, { ...p, children: [] }));

    pages.forEach((p) => {
      const pageWithChildren = pageMap.get(p.id)!;
      if (p.parent_id && pageMap.has(p.parent_id)) {
        pageMap.get(p.parent_id)!.children!.push(pageWithChildren);
      } else {
        rootPages.push(pageWithChildren);
      }
    });

    return rootPages;
  }, []);

  const hierarchicalPages = useMemo(
    () => buildHierarchy(pages),
    [pages, buildHierarchy],
  );

  const createPage = async (parentId?: string | null) => {
    setLoading(true);

    try {
      const result = await createPageAction({
        title: "Untitled",
        description: "",
      });

      if (!result?.data) throw new Error("No data returned from server");
      
      console.log("Page created:", result.data);
      
      // Ak je parentId definované, presuň stránku do foldera
      if (parentId) {
        await movePageAction({
          id: result.data.id,
          parent_id: parentId,
        });
      }
      
      // Načítame aktualizované dáta
      await loadAllData();
      
      // Navigujeme na novú stránku
      router.push(`/page/${result.data.id}`);
      setMobileOpen(false);
      
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
    if (!newFolderName.trim()) {
      alert("Please enter a folder name");
      return;
    }
    
    setLoading(true);
    try {
      const result = await createFolderAction({
        title: newFolderName,
        parent_id: folderParentId,
      });
      
      if (!result?.data) throw new Error("No data returned from server");
      
      console.log("Folder created:", result.data);
      
      setFolderModalOpen(false);
      setNewFolderName("");
      
      // Načítame aktualizované dáta
      await loadAllData();
      
      // Rozbalíme nový folder
      if (result.data.id) {
        setExpandedFolders(prev => new Set([...prev, result.data!.id]));
      }
      
    } catch (err) {
      console.error("Error creating folder:", err);
      alert(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const movePageToTrash = async (id: string) => {
    const prevPages = [...pages];
    setPages((prev) => prev.filter((p) => p.id !== id));

    try {
      const result = await moveToTrashAction({ id, table: "pages" });
      if (!result.data) throw new Error("Failed to move page to trash");
      await loadAllData();
    } catch (error) {
      console.error(error);
      setPages(prevPages);
      alert(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const movePage = async (pageId: string, targetFolderId: string) => {
    const prevPages = [...pages];
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, parent_id: targetFolderId || null } : p,
      ),
    );
    try {
      const result = await movePageAction({
        id: pageId,
        parent_id: targetFolderId || null,
      });

      if (!result?.data) throw new Error("Failed to move page");

      await loadAllData();
    } catch (error) {
      console.error(error);
      setPages(prevPages);
      alert(error instanceof Error ? error.message : "Failed to move page");
    }
  };

  const movePageDebounced = useMemo(() => debounce(movePage, 300), []);

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
    if (draggedPage?.is_folder === 1 && targetId === draggedPageId) return;

    if (targetId === "root") {
      movePageDebounced(draggedPageId, "");
    } else {
      const targetPage = pages.find((p) => p.id === targetId);
      if (targetPage?.is_folder === 1) {
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

  const isDescendant = (parentId: string, childId: string): boolean => {
    const page = pages.find((p) => p.id === childId);
    if (!page || !page.parent_id) return false;
    if (page.parent_id === parentId) return true;
    return isDescendant(parentId, page.parent_id);
  };

  const DraggablePageItem = memo(({ page }: { page: any }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id: page.id, data: { page } });
    const style = {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.5 : 1,
    };
    return (
      <div ref={setNodeRef} style={style}>
        <PageTreeItem page={page} dragHandleProps={{ attributes, listeners }} />
      </div>
    );
  });

  const DroppableFolder = ({
    page,
    children,
  }: {
    page: any;
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
      dragHandleProps,
    }: {
      page: any;
      dragHandleProps?: {
        attributes: DraggableAttributes;
        listeners: DraggableSyntheticListeners;
      };
    }) => {
      const isExpanded = expandedFolders.has(page.id);
      const hasChildren = page.children && page.children.length > 0;

      const getIcon = () => {
        if (page.is_folder === 1) {
          return <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />;
        } else {
          return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
        }
      };

      const content = (
        <div
          className={`group flex items-center gap-1 rounded-lg transition-colors hover:bg-accent ${
            currentPageId === page.id ? "bg-accent" : ""
          }`}
        >
          <button
            {...dragHandleProps}
            className="cursor-grab p-1 opacity-0 transition-opacity hover:bg-accent-foreground/10 rounded group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {page.is_folder === 1 ? (
            <>
              <button
                onClick={() => toggleFolder(page.id)}
                className="p-1 hover:bg-accent-foreground/10 rounded"
                disabled={!hasChildren}
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )
                ) : (
                  <div className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                className="flex flex-1 items-center gap-2 py-1.5 text-sm"
                onClick={() => {
                  router.push(`/page/${page.id}`);
                  setMobileOpen(false);
                }}
              >
                {getIcon()}
                <span className="flex-1 truncate text-left">
                  {page.icon && `${page.icon} `}{page.title}
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
                {getIcon()}
                <span className="flex-1 truncate text-left">
                  {page.icon && `${page.icon} `}{page.title}
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
              {page.is_folder === 1 && (
                <>
                  <DropdownMenuItem onClick={() => createPage(page.id)} disabled={loading}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => createFolder(page.id)} disabled={loading}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => movePageToTrash(page.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );

      return (
        <div>
          {page.is_folder === 1 ? (
            <DroppableFolder page={page}>{content}</DroppableFolder>
          ) : (
            content
          )}
          {page.is_folder === 1 && isExpanded && hasChildren && (
            <div className="ml-6">
              {page.children!.map((child: any) => (
                <DraggablePageItem key={child.id} page={child} />
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

            <div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <button
                  onClick={() => setPagesExpanded(!pagesExpanded)}
                  className="flex flex-1 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent-foreground"
                >
                  Pages
                </button>
                <div className="flex gap-1">
                  <Button
                    onClick={() => createFolder()}
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="New Folder"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FolderPlus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    onClick={() => createPage()}
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="New Page"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
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
                  {loadingPages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : hierarchicalPages.length === 0 ? (
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
          className={`hidden border-r bg-muted/30 transition-all duration-300 md:flex ${
            desktopCollapsed ? "w-0 overflow-hidden" : "w-64"
          }`}
        >
          <SidebarContent />
        </aside>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {desktopCollapsed && (
          <div className="hidden md:flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDesktopCollapsed(false)}
              className="h-9 w-9 absolute left-2 top-2 z-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        <DragOverlay>
          {activePage ? (
            <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 shadow-lg ring-2 ring-primary">
              {activePage.is_folder === 1 ? (
                <Folder className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="truncate">
                {activePage.icon && `${activePage.icon} `}{activePage.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      <Sheet open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <SheetContent side="right" className="max-w-md">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">New Folder</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFolderModalOpen(false)}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Folder name
              </label>
              <input
                type="text"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleFolderSubmit();
                  }
                }}
                disabled={loading}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setFolderModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleFolderSubmit} 
                disabled={loading || !newFolderName.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}