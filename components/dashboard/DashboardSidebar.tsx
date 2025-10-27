"use client";

import {
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
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
  FolderPlus,
  ChartNoAxesColumnIncreasing,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Page } from "@/types/applicationTypes";
import {
  createPageAction,
  getAllPagesAction,
  movePageAction,
} from "@/actions/pagesActions";
import { createFolderAction } from "@/actions/folderActions";

interface DashboardSidebarProps {
  initialPages: Page[];
  currentPageId?: string;
}

export function DashboardSidebar({
  initialPages,
}: DashboardSidebarProps) {
  const [, setPages] = useState<Page[]>(
    initialPages.filter((p) => p.in_trash === 0),
  );
  const [loading, setLoading] = useState(false);
  const [, setLoadingPages] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderParentId, setFolderParentId] = useState<string | null>(null);

  const router = useRouter();

  const loadAllData = useCallback(async () => {
    setLoadingPages(true);
    try {
      const pagesResult = (await getAllPagesAction()) as any;
      if (pagesResult?.data) {
        const allPages = pagesResult.data.filter((p: Page) => p.in_trash === 0);
        setPages(allPages);
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to load pages",
      );
    } finally {
      setLoadingPages(false);
    }
  }, []);

  const createPage = async (parentId?: string | null) => {
    setLoading(true);

    try {
      const result = await createPageAction({
        title: "Untitled",
        description: "",
      });

      if (!result?.data) throw new Error("No data returned from server");
      if (parentId) {
        await movePageAction({
          id: result.data.id,
          parent_id: parentId,
        });
      }

      await loadAllData();

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

      setFolderModalOpen(false);
      setNewFolderName("");

      await loadAllData();

      if (result.data.id) {
        setExpandedFolders((prev) => new Set([...prev, result.data!.id]));
      }
    } catch (err) {
      console.error("Error creating folder:", err);
      alert(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    return (
      <div className="flex h-full flex-col">
        {!isMobile && (
          <div className="flex items-center justify-between border-b p-4 shrink-0">
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
          <div className="p-2 h-full flex flex-col">
            <div className="space-y-1 flex-1">
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
                        window.location.replace("/dashboard");
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

              <div className="flex-1">
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
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <>
        <aside
          className={`hidden border-r bg-muted/30 transition-all duration-300 md:flex flex-col ${
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
                  if (e.key === "Enter" && !loading) {
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