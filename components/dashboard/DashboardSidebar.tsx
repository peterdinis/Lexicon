"use client";

import { FC, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  PlusCircle,
  Search,
  Settings,
  Trash,
  User,
  FileText,
  Plus,
  Folder,
  Loader2,
  AlertCircle,
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
import Link from "next/link";

const DashboardSidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  const [searchOpen, setSearchOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const workspaces = useQuery(api.workspaces.list);
  const pages = useQuery(api.pages.listByUser, {userId: user?.id!});

  const SidebarButton = ({
    icon: Icon,
    label,
    onClick,
    className = "",
    isActive = false,
  }: {
    icon: any;
    label: string;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
  }) => {
    const button = (
      <button
        onClick={onClick}
        className={`flex items-center justify-center ${collapsed ? "w-12 h-12" : "justify-start space-x-3 px-3 py-2"
          } text-sm transition-all duration-200 rounded-lg group relative ${isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          } ${className}`}
      >
        <Icon
          className={`${collapsed ? "w-5 h-5" : "w-4 h-4"
            } flex-shrink-0 transition-all duration-200`}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-medium"
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

  // Enhanced loading state component
  const LoadingState = ({ message }: { message: string }) => (
    <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "px-3"}`}>
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

  // Enhanced empty state component
  const EmptyState = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "px-3"}`}>
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

  // Error state component
  const ErrorState = ({ message }: { message: string }) => (
    <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "px-3"}`}>
      <AlertCircle className="w-4 h-4 text-destructive/60" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-destructive/80"
          >
            {message}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  // Enhanced section header component
  const SectionHeader = ({ 
    title, 
    onAdd, 
    addTooltip, 
    icon: Icon,
    count 
  }: { 
    title: string; 
    onAdd?: () => void; 
    addTooltip: string; 
    icon: any;
    count?: number;
  }) => (
    <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Icon className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {title}
            </span>
            {count !== undefined && (
              <span className="text-xs text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`${collapsed ? "w-12 h-12" : "w-6 h-6"
              } rounded-lg hover:bg-accent/60 hover:text-foreground text-muted-foreground flex items-center justify-center transition-all duration-200 hover:scale-105`}
            onClick={onAdd}
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{addTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <TooltipProvider>
      {/* ---- Dialogs ---- */}
      <SearchDialog searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
      <TrashDialog trashOpen={trashOpen} setTrashOpen={setTrashOpen} />
      <WorkspaceDialog
        workspaceOpen={workspaceOpen}
        setWorkspaceOpen={setWorkspaceOpen}
      />
      <SettingsDialog settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} />

      {/* ---- Sidebar ---- */}
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: collapsed ? 88 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="group/sidebar h-full bg-background/60 backdrop-blur-sm border-r border-border/60 sticky flex flex-col z-[99999] min-h-screen left-0 top-0 shadow-sm"
        style={{ overflow: "visible" }}
      >
        {/* Collapse toggle button */}
        <div className="flex justify-end p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-8 h-8 text-muted-foreground rounded-lg hover:bg-accent/60 hover:text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                {collapsed ? (
                  <ChevronsRight className="w-5 h-5" />
                ) : (
                  <ChevronsLeft className="w-5 h-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Sidebar content */}
        <div
          className="flex flex-col flex-1 px-3 space-y-6 pb-3"
          style={{ overflow: "visible" }}
        >
          {/* User section */}
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"
              } text-sm font-semibold`}
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer">
                    <User className="w-6 h-6 text-primary flex-shrink-0" />
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="truncate flex flex-col justify-center min-h-[40px]"
                  >
                    <div className="text-foreground font-medium leading-tight">
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

          {/* Quick actions */}
          <div className="space-y-2">
            <SidebarButton
              icon={Search}
              label="Search"
              onClick={() => setSearchOpen(true)}
            />
            <SidebarButton
              icon={Trash}
              label="Trash"
              onClick={() => setTrashOpen(true)}
            />
          </div>

          {/* Workspaces section */}
          <div className="flex-1 space-y-3">
            <SectionHeader
              title="Workspaces"
              icon={Folder}
              onAdd={() => setWorkspaceOpen(true)}
              addTooltip="Add workspace"
              count={workspaces?.length}
            />

            <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {workspaces === undefined ? (
                <LoadingState message="Loading workspaces..." />
              ) : workspaces.length === 0 ? (
                <EmptyState message="No workspaces yet" icon={Folder} />
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
            </div>
          </div>

          {/* Pages section */}
          <div className="flex-1 space-y-3">
            <SectionHeader
              title="Pages"
              icon={FileText}
              onAdd={() => {/* Link handles navigation */}}
              addTooltip="New Page"
              count={pages?.length}
            />

            <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {pages === undefined ? (
                <LoadingState message="Loading pages..." />
              ) : pages.length === 0 ? (
                <EmptyState message="No pages yet" icon={FileText} />
              ) : (
                <motion.ul 
                  className="space-y-1"
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
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-auto pt-4 border-t border-border/60">
            <SidebarButton
              icon={Settings}
              label="Settings"
              onClick={() => setSettingsOpen(true)}
            />
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default DashboardSidebar;