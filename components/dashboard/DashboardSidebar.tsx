"use client";

import { FC, useState } from "react";
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
  BookOpen,
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
import { useClerk, useUser } from "@clerk/clerk-react";
import { Button } from "../ui/button";
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

const DashboardSidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    workspaces: true,
    pages: true,
    templates: true,
    files: true,
  });
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const router = useRouter();
  const { openModal, setOpenModal, isOpen } = useModalStore();

  const workspaces = useQuery(api.workspaces.list);
  const pages = useQuery(api.pages.listByUser, { userId: user?.id! });
  const templates = useQuery(api.templates.listByUser, { userId: user?.id! });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SidebarButton = ({
    icon: Icon,
    label,
    onClick,
    className = "",
    isActive = false,
    showLabel = true,
  }: {
    icon: any;
    label: string;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
    showLabel?: boolean;
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
  };

  const LoadingState = ({ message }: { message: string }) => (
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
  );

  const EmptyState = ({
    message,
    icon: Icon,
  }: {
    message: string;
    icon: any;
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
  );

  const SectionHeader = ({
    title,
    onAdd,
    addTooltip,
    icon: Icon,
    count,
    sectionKey,
  }: {
    title: string;
    onAdd?: () => void;
    addTooltip: string;
    icon: any;
    count?: number;
    sectionKey: keyof typeof expandedSections;
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
            onClick={() => toggleSection(sectionKey)}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="rounded-lg hover:bg-accent/60 hover:text-foreground text-muted-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 w-6 h-6 ml-2"
                  onClick={onAdd}
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{addTooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );

  return (
    <TooltipProvider>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-8 h-8 text-muted-foreground rounded-lg hover:bg-accent/60 hover:text-foreground flex items-center justify-center transition-all duration-200"
              >
                {collapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-col flex-1 px-3 space-y-4 pb-3 overflow-y-auto">
          <div
            className={cn(
              "flex items-center py-2",
              collapsed ? "justify-center" : "space-x-3",
            )}
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer">
                    <User className="w-5 h-5 text-primary flex-shrink-0" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div>
                    <p className="font-medium">
                      {user?.firstName + " " + user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="truncate flex flex-col justify-center min-h-[36px]"
                  >
                    <div className="text-foreground font-medium leading-tight text-sm">
                      {user?.firstName + " " + user?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground leading-tight truncate">
                      {user?.emailAddresses[0]?.emailAddress}
                    </div>
                    <Button
                      variant={"link"}
                      onClick={() => signOut()}
                      className="p-0 h-auto justify-start font-normal text-xs hover:text-primary transition-colors"
                    >
                      Logout
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>

          <div className="space-y-1">
            <SidebarButton
              icon={Home}
              label="Home"
              onClick={() => router.push("/")}
              isActive={pathname === "/"}
            />
            <SidebarButton
              icon={Search}
              label="Search"
              onClick={() => setOpenModal("search")}
            />
            <SidebarButton
              icon={Trash}
              label="Trash"
              onClick={() => setOpenModal("trash")}
            />
          </div>

          <div className="space-y-1">
            <SectionHeader
              title="Workspaces"
              icon={Database}
              onAdd={() => setOpenModal("workspace")}
              addTooltip="Add workspace"
              count={workspaces?.length}
              sectionKey="workspaces"
            />
            <AnimatePresence>
              {!collapsed && expandedSections.workspaces && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 overflow-hidden"
                >
                  {workspaces === undefined ? (
                    <LoadingState message="Loading workspaces..." />
                  ) : workspaces.length === 0 ? (
                    <EmptyState message="No workspaces yet" icon={Database} />
                  ) : (
                    <motion.ul
                      className="space-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatePresence>
                        {workspaces.map((workspace, i) => (
                          <motion.div
                            key={workspace._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.05, duration: 0.2 }}
                          >
                            <WorkspaceItem
                              name={workspace.name}
                              index={i}
                              id={workspace._id as unknown as Id<"workspaces">}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1">
            <SectionHeader
              title="Recent Pages"
              icon={FileStack}
              addTooltip="New Page"
              sectionKey="pages"
              onAdd={() => {}}
              count={pages?.length}
            />
            <AnimatePresence>
              {!collapsed && expandedSections.pages && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 overflow-hidden"
                >
                  {pages === undefined ? (
                    <LoadingState message="Loading pages..." />
                  ) : pages.length === 0 ? (
                    <EmptyState message="No pages yet" icon={FileStack} />
                  ) : (
                    <motion.ul
                      className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatePresence>
                        {pages.map((page, i) => (
                          <motion.div
                            key={page._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.05, duration: 0.2 }}
                          >
                            <PagesItem
                              name={page.title}
                              index={i}
                              id={page._id as unknown as Id<"pages">}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1">
            <SectionHeader
              title="Templates"
              icon={Sparkles}
              onAdd={() => setOpenModal("template")}
              addTooltip="New Template"
              count={templates?.length}
              sectionKey="templates"
            />
            <AnimatePresence>
              {!collapsed && expandedSections.templates && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 overflow-hidden"
                >
                  {templates === undefined ? (
                    <LoadingState message="Loading templates..." />
                  ) : templates.length === 0 ? (
                    <EmptyState message="No templates yet" icon={Sparkles} />
                  ) : (
                    <motion.ul
                      className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatePresence>
                        {templates.map((template, i) => (
                          <motion.div
                            key={template._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.05, duration: 0.2 }}
                          >
                            <TemplatesItem
                              name={template.name}
                              index={i}
                              id={template._id as unknown as Id<"templates">}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1">
            <SectionHeader
              title="Files"
              icon={Box}
              onAdd={() => setOpenModal("upload")}
              addTooltip="Upload File"
              sectionKey="files"
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
                    onClick={() => router.push("/files")}
                    isActive={pathname === "/files"}
                    showLabel={!collapsed}
                  />
                  <SidebarButton
                    icon={File}
                    label="Upload File"
                    onClick={() => setOpenModal("upload")}
                    showLabel={!collapsed}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-auto pt-4 border-t border-border/40">
            <SidebarButton
              icon={Settings}
              label="Settings"
              onClick={() => setOpenModal("settings")}
            />
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default DashboardSidebar;
