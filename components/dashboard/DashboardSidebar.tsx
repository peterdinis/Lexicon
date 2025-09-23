"use client";

import { FC, useState, useRef, useCallback, memo, JSX } from "react";
import {
  PlusCircle,
  Search,
  Settings,
  Trash,
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
  LucideIcon,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClerk, useUser } from "@clerk/nextjs";
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

// ---------------------- Typy ----------------------
interface Workspace {
  _id: string;
  name: string;
}

interface Page {
  _id: string;
  title: string;
}

interface Template {
  _id: string;
  name: string;
  content: string;
}

interface ExpandedSections {
  workspaces: boolean;
  pages: boolean;
  templates: boolean;
  files: boolean;
}

// ---------------------- Komponenty ----------------------
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
    icon: LucideIcon;
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
    expandedSections: ExpandedSections;
    onToggleSection: (section: keyof ExpandedSections) => void;
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
    logout,
  }: {
    collapsed: boolean;
    onOpenModal: (modal: string) => void;
    logout: () => void;
  }) => (
    <div className="mt-auto pt-4 border-t border-border/40 space-y-1">
      <SidebarButton
        icon={Settings}
        label="Settings"
        onClick={() => onOpenModal("settings")}
        collapsed={collapsed}
      />
      <SidebarButton
        icon={LogOut}
        label="Logout"
        onClick={() => logout()}
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
    icon: LucideIcon;
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
    icon: LucideIcon;
    count?: number;
    sectionKey: keyof ExpandedSections;
    collapsed: boolean;
    expandedSections: ExpandedSections;
    onToggleSection: (section: keyof ExpandedSections) => void;
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

const VirtualizedSection = <T extends { _id: string }>({
  items,
  collapsed,
  expandedSections,
  sectionKey,
  onToggleSection,
  renderItem,
  onAdd,
  icon,
  title,
}: {
  items: T[] | undefined;
  collapsed: boolean;
  expandedSections: ExpandedSections;
  sectionKey: keyof ExpandedSections;
  onToggleSection: (section: keyof ExpandedSections) => void;
  renderItem: (item: T, index: number) => JSX.Element;
  onAdd?: () => void;
  icon: LucideIcon;
  title: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const count = items?.length || 0;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => ref.current,
    estimateSize: () => 40,
    overscan: 5,
    getItemKey: (index) => items?.[index]?._id || `${sectionKey}-${index}`,
  });

  return (
    <div className="space-y-1">
      <SectionHeader
        title={title}
        icon={icon}
        onAdd={onAdd}
        addTooltip={`Add ${title}`}
        count={count}
        sectionKey={sectionKey}
        collapsed={collapsed}
        expandedSections={expandedSections}
        onToggleSection={onToggleSection}
      />
      <AnimatePresence>
        {!collapsed && expandedSections[sectionKey] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {items === undefined ? (
              <LoadingState
                message={`Loading ${title.toLowerCase()}...`}
                collapsed={collapsed}
              />
            ) : count === 0 ? (
              <EmptyState
                message={`No ${title.toLowerCase()} yet`}
                icon={icon}
                collapsed={collapsed}
              />
            ) : (
              <div
                ref={ref}
                className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              >
                <div
                  style={{
                    height: virtualizer.getTotalSize(),
                    position: "relative",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const item = items[virtualRow.index];
                    if (!item) return null;
                    return (
                      <div
                        key={item._id}
                        style={{
                          position: "absolute",
                          top: virtualRow.start,
                          left: 0,
                          width: "100%",
                          height: virtualRow.size,
                        }}
                      >
                        {renderItem(item, virtualRow.index)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardSidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    workspaces: true,
    pages: true,
    templates: true,
    files: true,
  });

  const { signOut } = useClerk();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenModal, isOpen } = useModalStore();

  const workspaces = useQuery(api.workspaces.list);
  const pages = useQuery(api.pages.listByUser, { userId: user?.id! });
  const templates = useQuery(api.templates.listByUser, { userId: user?.id! });

  const handleToggleCollapse = useCallback(
    () => setCollapsed((prev) => !prev),
    [],
  );
  const handleToggleSection = useCallback((section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);
  const handleNavigate = useCallback(
    (path: any) => router.push(path),
    [router],
  );
  const handleOpenModal = useCallback(
    (modal: any) => setOpenModal(modal),
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
          <StaticSidebarButtons
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
          />

          <VirtualizedSection
            items={workspaces}
            collapsed={collapsed}
            expandedSections={expandedSections}
            sectionKey="workspaces"
            onToggleSection={handleToggleSection}
            renderItem={(item, index) => (
              <WorkspaceItem
                name={item.name}
                index={index}
                id={item._id as Id<"workspaces">}
              />
            )}
            onAdd={() => handleOpenModal("workspace")}
            icon={Database}
            title="Workspaces"
          />

          <VirtualizedSection
            items={pages}
            collapsed={collapsed}
            expandedSections={expandedSections}
            sectionKey="pages"
            onToggleSection={handleToggleSection}
            renderItem={(item, index) => (
              <PagesItem
                name={item.title}
                index={index}
                id={item._id as Id<"pages">}
              />
            )}
            icon={FileStack}
            title="Recent Pages"
          />

          <VirtualizedSection
            items={templates}
            collapsed={collapsed}
            expandedSections={expandedSections}
            sectionKey="templates"
            onToggleSection={handleToggleSection}
            renderItem={(item, index) => (
              <TemplatesItem
                name={item.name}
                content={item.content}
                index={index}
                id={item._id as Id<"templates">}
              />
            )}
            onAdd={() => handleOpenModal("template")}
            icon={Sparkles}
            title="Templates"
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
            logout={signOut}
            collapsed={collapsed}
            onOpenModal={handleOpenModal}
          />
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default DashboardSidebar;
