"use client";

import { FC, useState, useRef, useMemo, useCallback, memo } from "react";
import {
  PlusCircle,
  Search,
  Settings,
  Trash,
  User,
  Loader2,
  File,
  FileX2,
  Home,
  FileStack,
  Sparkles,
  Box,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@clerk/nextjs";
import WorkspaceItem from "../workspaces/WorkspaceItem";
import WorkspaceDialog from "../workspaces/WorkspaceDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import SearchDialog from "../search/SearchDialog";
import TrashDialog from "../trash/TrashDialog";
import SettingsDialog from "../settings/SettingsDialog";
import PagesItem from "../pages/PagesItem";
import { useRouter, usePathname } from "next/navigation";
import TemplatesItem from "../templates/TemplateItem";
import TemplateDialog from "../templates/TemplateDialog";
import UploadDialog from "../files/UploadFileDialog";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/store/modalsStore";
import { useVirtualizer } from "@tanstack/react-virtual";

// Memoizované statické komponenty
const SidebarButton = memo(
  ({
    icon: Icon,
    label,
    onClick,
    className = "",
    isActive = false,
    showLabel = true,
    collapsed,
  }: {
    icon: any;
    label: string;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
    showLabel?: boolean;
    collapsed: boolean;
  }) => {
    const button = (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center text-sm transition-all duration-200 rounded-lg group relative",
          collapsed
            ? "w-12 h-10 justify-center"
            : "justify-start space-x-3 px-3 py-2 w-full",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
          className,
        )}
      >
        <Icon
          className={cn(
            "flex-shrink-0 transition-all duration-200",
            collapsed ? "w-5 h-5" : "w-4 h-4",
          )}
        />
        <AnimatePresence>
          {!collapsed && showLabel && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-medium truncate text-sm"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );

    return collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex justify-center">{button}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      button
    );
  },
);

SidebarButton.displayName = "SidebarButton";

const CollapseButton = memo(
  ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => {
    const button = (
      <button
        onClick={onToggle}
        className="w-8 h-8 text-muted-foreground rounded-lg hover:bg-accent/60 hover:text-foreground flex items-center justify-center transition-all duration-200"
      >
        {collapsed ? (
          <PanelLeftOpen className="w-4 h-4" />
        ) : (
          <PanelLeftClose className="w-4 h-4" />
        )}
      </button>
    );

    return collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      button
    );
  },
);

CollapseButton.displayName = "CollapseButton";

const StaticSidebarButtons = memo(
  ({
    collapsed,
    pathname,
    onNavigate,
    onOpenModal,
  }: {
    collapsed: boolean;
    pathname: string;
    onNavigate: (path: string) => void;
    onOpenModal: (modal: string) => void;
  }) => (
    <div className="space-y-1">
      <SidebarButton
        icon={Home}
        label="Home"
        onClick={() => onNavigate("/")}
        isActive={pathname === "/"}
        collapsed={collapsed}
      />
      <SidebarButton
        icon={Search}
        label="Search"
        onClick={() => onOpenModal("search")}
        collapsed={collapsed}
      />
      <SidebarButton
        icon={Trash}
        label="Trash"
        onClick={() => onOpenModal("trash")}
        collapsed={collapsed}
      />
    </div>
  ),
);

StaticSidebarButtons.displayName = "StaticSidebarButtons";

const FilesSection = memo(
  ({
    collapsed,
    expandedSections,
    onToggleSection,
    onOpenModal,
    pathname,
    onNavigate,
  }: {
    collapsed: boolean;
    expandedSections: { files: boolean };
    onToggleSection: (section: string) => void;
    onOpenModal: (modal: string) => void;
    pathname: string;
    onNavigate: (path: string) => void;
  }) => (
    <div className="space-y-1">
      <SectionHeader
        title="Files"
        icon={Box}
        onAdd={() => onOpenModal("upload")}
        addTooltip="Upload File"
        sectionKey="files"
        collapsed={collapsed}
        expandedSections={expandedSections}
        onToggleSection={onToggleSection}
      />
      <AnimatePresence>
        {!collapsed && expandedSections.files && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 overflow-hidden"
          >
            <SidebarButton
              icon={FileX2}
              label="My Files"
              onClick={() => onNavigate("/files")}
              isActive={pathname === "/files"}
              showLabel={!collapsed}
              collapsed={collapsed}
            />
            <SidebarButton
              icon={File}
              label="Upload File"
              onClick={() => onOpenModal("upload")}
              showLabel={!collapsed}
              collapsed={collapsed}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ),
);

FilesSection.displayName = "FilesSection";

const SettingsSection = memo(
  ({
    collapsed,
    onOpenModal,
  }: {
    collapsed: boolean;
    onOpenModal: (modal: string) => void;
  }) => (
    <div className="mt-auto pt-4 border-t border-border/40">
      <SidebarButton
        icon={Settings}
        label="Settings"
        onClick={() => onOpenModal("settings")}
        collapsed={collapsed}
      />
    </div>
  ),
);

SettingsSection.displayName = "SettingsSection";

const LoadingState = memo(
  ({ message, collapsed }: { message: string; collapsed: boolean }) => (
    <div
      className={cn(
        "flex items-center gap-2 py-1",
        collapsed ? "justify-center" : "px-3",
      )}
    >
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground"
          >
            {message}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  ),
);

LoadingState.displayName = "LoadingState";

const EmptyState = memo(
  ({
    message,
    icon: Icon,
    collapsed,
  }: {
    message: string;
    icon: any;
    collapsed: boolean;
  }) => (
    <div
      className={cn(
        "flex items-center gap-2 py-2",
        collapsed ? "justify-center" : "px-3",
      )}
    >
      <Icon className="w-4 h-4 text-muted-foreground/60" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground/80"
          >
            {message}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  ),
);

EmptyState.displayName = "EmptyState";

const SectionHeader = memo(
  ({
    title,
    onAdd,
    addTooltip,
    icon: Icon,
    count,
    sectionKey,
    collapsed,
    expandedSections,
    onToggleSection,
  }: {
    title: string;
    onAdd?: () => void;
    addTooltip: string;
    icon: any;
    count?: number;
    sectionKey: string;
    collapsed: boolean;
    expandedSections: Record<string, boolean>;
    onToggleSection: (section: string) => void;
  }) => (
    <div
      className={cn(
        "flex items-center py-2 group",
        collapsed ? "justify-center" : "justify-between",
      )}
    >
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-full">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            <p>{title}</p>
            {count !== undefined && <p className="text-xs">{count} items</p>}
          </TooltipContent>
        </Tooltip>
      ) : (
        <>
          <button
            className="flex items-center gap-2 flex-1"
            onClick={() => onToggleSection(sectionKey)}
          >
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {title}
            </span>
            {count !== undefined && (
              <span className="text-xs text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
            <div className="ml-auto">
              {expandedSections[sectionKey] ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
              )}
            </div>
          </button>
          {onAdd && (
            <button
              className="rounded-lg hover:bg-accent/60 hover:text-foreground text-muted-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 w-6 h-6 ml-2"
              onClick={onAdd}
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          )}
        </>
      )}
    </div>
  ),
);

SectionHeader.displayName = "SectionHeader";

// Virtualizované sekcie
const VirtualizedWorkspaces = memo(
  ({
    workspaces,
    collapsed,
    expandedSections,
    onToggleSection,
    onOpenModal,
  }: {
    workspaces: any[] | undefined;
    collapsed: boolean;
    expandedSections: { workspaces: boolean };
    onToggleSection: (section: string) => void;
    onOpenModal: (modal: string) => void;
  }) => {
    const workspacesRef = useRef<HTMLDivElement>(null);
    const workspacesCount = useMemo(
      () => workspaces?.length || 0,
      [workspaces?.length],
    );

    const workspacesVirtualizer = useVirtualizer({
      count: workspacesCount,
      getScrollElement: () => workspacesRef.current,
      estimateSize: () => 40,
      overscan: 5,
      getItemKey: (index) => workspaces?.[index]?._id || `workspace-${index}`,
    });

    const renderWorkspaceItem = useCallback(
      (virtualRow: any) => {
        const workspace = workspaces?.[virtualRow.index];
        if (!workspace) return null;

        return (
          <div
            key={workspace._id}
            style={{
              position: "absolute",
              top: virtualRow.start,
              left: 0,
              width: "100%",
              height: virtualRow.size,
            }}
          >
            <WorkspaceItem
              name={workspace.name}
              index={virtualRow.index}
              id={workspace._id as unknown as Id<"workspaces">}
            />
          </div>
        );
      },
      [workspaces],
    );

    return (
      <div className="space-y-1">
        <SectionHeader
          title="Workspaces"
          icon={Database}
          onAdd={() => onOpenModal("workspace")}
          addTooltip="Add workspace"
          count={workspacesCount}
          sectionKey="workspaces"
          collapsed={collapsed}
          expandedSections={expandedSections}
          onToggleSection={onToggleSection}
        />
        <AnimatePresence>
          {!collapsed && expandedSections.workspaces && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {workspaces === undefined ? (
                <LoadingState
                  message="Loading workspaces..."
                  collapsed={collapsed}
                />
              ) : workspacesCount === 0 ? (
                <EmptyState
                  message="No workspaces yet"
                  icon={Database}
                  collapsed={collapsed}
                />
              ) : (
                <div
                  ref={workspacesRef}
                  className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                >
                  <div
                    style={{
                      height: workspacesVirtualizer.getTotalSize(),
                      position: "relative",
                    }}
                  >
                    {workspacesVirtualizer
                      .getVirtualItems()
                      .map(renderWorkspaceItem)}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

VirtualizedWorkspaces.displayName = "VirtualizedWorkspaces";

const VirtualizedPages = memo(
  ({
    pages,
    collapsed,
    expandedSections,
    onToggleSection,
  }: {
    pages: any[] | undefined;
    collapsed: boolean;
    expandedSections: { pages: boolean };
    onToggleSection: (section: string) => void;
  }) => {
    const pagesRef = useRef<HTMLDivElement>(null);
    const pagesCount = useMemo(() => pages?.length || 0, [pages?.length]);

    const pagesVirtualizer = useVirtualizer({
      count: pagesCount,
      getScrollElement: () => pagesRef.current,
      estimateSize: () => 40,
      overscan: 5,
      getItemKey: (index) => pages?.[index]?._id || `page-${index}`,
    });

    const renderPageItem = useCallback(
      (virtualRow: any) => {
        const page = pages?.[virtualRow.index];
        if (!page) return null;

        return (
          <div
            key={page._id}
            style={{
              position: "absolute",
              top: virtualRow.start,
              left: 0,
              width: "100%",
              height: virtualRow.size,
            }}
          >
            <PagesItem
              name={page.title}
              index={virtualRow.index}
              id={page._id as unknown as Id<"pages">}
            />
          </div>
        );
      },
      [pages],
    );

    return (
      <div className="space-y-1">
        <SectionHeader
          title="Recent Pages"
          icon={FileStack}
          addTooltip="New Page"
          sectionKey="pages"
          count={pagesCount}
          collapsed={collapsed}
          expandedSections={expandedSections}
          onToggleSection={onToggleSection}
        />
        <AnimatePresence>
          {!collapsed && expandedSections.pages && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {pages === undefined ? (
                <LoadingState
                  message="Loading pages..."
                  collapsed={collapsed}
                />
              ) : pagesCount === 0 ? (
                <EmptyState
                  message="No pages yet"
                  icon={FileStack}
                  collapsed={collapsed}
                />
              ) : (
                <div
                  ref={pagesRef}
                  className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                >
                  <div
                    style={{
                      height: pagesVirtualizer.getTotalSize(),
                      position: "relative",
                    }}
                  >
                    {pagesVirtualizer.getVirtualItems().map(renderPageItem)}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

VirtualizedPages.displayName = "VirtualizedPages";

const VirtualizedTemplates = memo(
  ({
    templates,
    collapsed,
    expandedSections,
    onToggleSection,
    onOpenModal,
  }: {
    templates: any[] | undefined;
    collapsed: boolean;
    expandedSections: { templates: boolean };
    onToggleSection: (section: string) => void;
    onOpenModal: (modal: string) => void;
  }) => {
    const templatesRef = useRef<HTMLDivElement>(null);
    const templatesCount = useMemo(
      () => templates?.length || 0,
      [templates?.length],
    );

    const templatesVirtualizer = useVirtualizer({
      count: templatesCount,
      getScrollElement: () => templatesRef.current,
      estimateSize: () => 40,
      overscan: 5,
      getItemKey: (index) => templates?.[index]?._id || `template-${index}`,
    });

    const renderTemplateItem = useCallback(
      (virtualRow: any) => {
        const template = templates?.[virtualRow.index];
        if (!template) return null;

        return (
          <div
            key={template._id}
            style={{
              position: "absolute",
              top: virtualRow.start,
              left: 0,
              width: "100%",
              height: virtualRow.size,
            }}
          >
            <TemplatesItem
              name={template.name}
              content={template.content}
              index={virtualRow.index}
              id={template._id as unknown as Id<"templates">}
            />
          </div>
        );
      },
      [templates],
    );

    return (
      <div className="space-y-1">
        <SectionHeader
          title="Templates"
          icon={Sparkles}
          onAdd={() => onOpenModal("template")}
          addTooltip="New Template"
          count={templatesCount}
          sectionKey="templates"
          collapsed={collapsed}
          expandedSections={expandedSections}
          onToggleSection={onToggleSection}
        />
        <AnimatePresence>
          {!collapsed && expandedSections.templates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {templates === undefined ? (
                <LoadingState
                  message="Loading templates..."
                  collapsed={collapsed}
                />
              ) : templatesCount === 0 ? (
                <EmptyState
                  message="No templates yet"
                  icon={Sparkles}
                  collapsed={collapsed}
                />
              ) : (
                <div
                  ref={templatesRef}
                  className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                >
                  <div
                    style={{
                      height: templatesVirtualizer.getTotalSize(),
                      position: "relative",
                    }}
                  >
                    {templatesVirtualizer
                      .getVirtualItems()
                      .map(renderTemplateItem)}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

VirtualizedTemplates.displayName = "VirtualizedTemplates";

const DashboardSidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    workspaces: true,
    pages: true,
    templates: true,
    files: true,
  });

  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenModal, isOpen } = useModalStore();

  const workspaces = useQuery(api.workspaces.list);
  const pages = useQuery(api.pages.listByUser, { userId: user?.id! });
  const templates = useQuery(api.templates.listByUser, { userId: user?.id! });

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  // TODO: Fix later any use custom types

  const handleToggleSection = useCallback((section: any) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleNavigate = useCallback(
    (path: any) => {
      router.push(path);
    },
    [router],
  );

  const handleOpenModal = useCallback(
    (modal: any) => {
      setOpenModal(modal);
    },
    [setOpenModal],
  );

  return (
    <TooltipProvider>
      {/* DIALOGS */}
      <SearchDialog
        searchOpen={isOpen("search")}
        setSearchOpen={(open) => setOpenModal(open ? "search" : null)}
      />
      <TrashDialog
        trashOpen={isOpen("trash")}
        setTrashOpen={(open) => setOpenModal(open ? "trash" : null)}
      />
      <WorkspaceDialog
        workspaceOpen={isOpen("workspace")}
        setWorkspaceOpen={(open) => setOpenModal(open ? "workspace" : null)}
      />
      <SettingsDialog
        settingsOpen={isOpen("settings")}
        setSettingsOpen={(open) => setOpenModal(open ? "settings" : null)}
      />
      <TemplateDialog
        open={isOpen("template")}
        setOpen={(open) => setOpenModal(open ? "template" : null)}
      />
      <UploadDialog
        uploadDialogOpen={isOpen("upload")}
        setUploadDialogOpen={(open) => setOpenModal(open ? "upload" : null)}
      />

      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: collapsed ? 64 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="group/sidebar h-full bg-background/95 backdrop-blur-sm border-r border-border/40 flex flex-col z-[99999] min-h-screen left-0 top-0 shadow-sm sticky"
        style={{ overflow: "visible" }}
      >
        <div className="flex justify-end p-3 pb-0">
          <CollapseButton
            collapsed={collapsed}
            onToggle={handleToggleCollapse}
          />
        </div>

        <div className="flex flex-col flex-1 px-3 space-y-4 pb-3 overflow-y-auto">
          {/* Static Sidebar buttons */}
          <StaticSidebarButtons
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
          />

          {/* Virtualized Sections */}
          <VirtualizedWorkspaces
            workspaces={workspaces}
            collapsed={collapsed}
            expandedSections={expandedSections}
            onToggleSection={handleToggleSection}
            onOpenModal={handleOpenModal}
          />

          <VirtualizedPages
            pages={pages}
            collapsed={collapsed}
            expandedSections={expandedSections}
            onToggleSection={handleToggleSection}
          />

          <VirtualizedTemplates
            templates={templates}
            collapsed={collapsed}
            expandedSections={expandedSections}
            onToggleSection={handleToggleSection}
            onOpenModal={handleOpenModal}
          />

          <FilesSection
            collapsed={collapsed}
            expandedSections={expandedSections}
            onToggleSection={handleToggleSection}
            onOpenModal={handleOpenModal}
            pathname={pathname}
            onNavigate={handleNavigate}
          />

          <SettingsSection
            collapsed={collapsed}
            onOpenModal={handleOpenModal}
          />
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default DashboardSidebar;
