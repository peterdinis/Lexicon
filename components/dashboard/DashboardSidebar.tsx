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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Simple Tooltip component (shadcn/ui style)
const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover border rounded-md shadow-md text-sm text-popover-foreground z-50 whitespace-nowrap">
          {content}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover border-l border-b rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const DashboardSidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const SidebarButton = ({ icon: Icon, label, onClick, className = "" }: {
    icon: any,
    label: string,
    onClick?: () => void,
    className?: string
  }) => {
    const button = (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-2 py-1 w-full transition-colors ${className}`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );

    return collapsed ? (
      <Tooltip content={label}>
        {button}
      </Tooltip>
    ) : button;
  };

  const WorkspaceItem = ({ name, index }: { name: string, index: number }) => {
    const item = (
      <li className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent cursor-pointer transition-colors">
        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              {name}
            </motion.span>
          )}
        </AnimatePresence>
      </li>
    );

    return collapsed ? (
      <Tooltip content={name}>
        {item}
      </Tooltip>
    ) : item;
  };

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="group/sidebar h-full bg-background/40 border-r overflow-hidden sticky flex flex-col z-[99999] min-h-screen left-0 top-0"
    >
      {/* Collapse toggle button */}
      <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-3 right-2 w-6 h-6 text-muted-foreground rounded-sm hover:bg-accent flex items-center justify-center transition-colors z-10"
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </Tooltip>

      {/* Sidebar content */}
      <div className="flex flex-col flex-1 p-3 space-y-4 overflow-y-auto">
        {/* User section */}
        <div className="flex items-center space-x-2 text-sm font-medium pt-2">
          <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="truncate"
              >
                Logged in User
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Search */}
        <SidebarButton icon={Search} label="Search" />

        {/* Add New Page */}
        <SidebarButton 
          icon={Plus} 
          label="New Page" 
          onClick={() => console.log('New page')}
        />

        {/* Trash after search */}
        <SidebarButton icon={Trash} label="Trash" />

        {/* Workspaces section */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  WORKSPACES
                </motion.span>
              )}
            </AnimatePresence>
            <Tooltip content="Add workspace">
              <button 
                className="hover:text-foreground hover:bg-accent rounded-sm p-1 transition-colors"
                onClick={() => console.log('Add workspace')}
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <ul className="space-y-1">
            {["Workspace 1", "Workspace 2", "My Projects"].map((workspace, i) => (
              <WorkspaceItem key={i} name={workspace} index={i} />
            ))}
          </ul>

          {/* Add workspace button when collapsed */}
          {collapsed && (
            <div className="mt-2">
              <SidebarButton 
                icon={PlusCircle} 
                label="Add Workspace" 
                onClick={() => console.log('Add workspace')}
              />
            </div>
          )}
        </div>

        {/* Pages section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  RECENT PAGES
                </motion.span>
              )}
            </AnimatePresence>
            <Tooltip content="New page">
              <button 
                className="hover:text-foreground hover:bg-accent rounded-sm p-1 transition-colors"
                onClick={() => console.log('New page')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <ul className="space-y-1">
            {["Getting Started", "Project Notes", "Meeting Minutes"].map((page, i) => {
              const item = (
                <li 
                  key={i}
                  className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="truncate text-sm"
                      >
                        {page}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </li>
              );

              return collapsed ? (
                <Tooltip key={i} content={page}>
                  {item}
                </Tooltip>
              ) : item;
            })}
          </ul>
        </div>

        {/* Footer actions */}
        <div className="mt-auto space-y-1 border-t pt-4">
          <SidebarButton icon={Settings} label="Settings" />
        </div>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;