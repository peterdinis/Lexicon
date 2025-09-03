
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DashboardSidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const SidebarButton = ({ icon: Icon, label, onClick, className = "", isActive = false }: {
    icon: any,
    label: string,
    onClick?: () => void,
    className?: string,
    isActive?: boolean
  }) => {
    const button = (
      <button
        onClick={onClick}
        className={`flex items-center justify-center ${collapsed ? 'w-12 h-12' : 'justify-start space-x-3 px-3 py-2'} text-sm transition-all duration-200 rounded-lg group relative ${
          isActive 
            ? 'bg-primary/10 text-primary border border-primary/20' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
        } ${className}`}
      >
        <Icon className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-all duration-200`} />
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
          <div className="flex justify-center">
            {button}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    ) : button;
  };

  const WorkspaceItem = ({ name, index, isActive = false }: { name: string, index: number, isActive?: boolean }) => {
    const item = (
      <li className={`flex items-center transition-all duration-200 rounded-lg cursor-pointer group ${
        collapsed ? 'justify-center w-12 h-12 mx-auto' : 'justify-start space-x-3 px-3 py-2'
      } ${
        isActive 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground'
      }`}>
        {collapsed ? (
          <Folder className="w-5 h-5 flex-shrink-0" />
        ) : (
          <>
            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            <AnimatePresence>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="truncate font-medium"
              >
                {name}
              </motion.span>
            </AnimatePresence>
          </>
        )}
      </li>
    );

    return collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          {item}
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    ) : item;
  };

  const PageItem = ({ name, index, isActive = false }: { name: string, index: number, isActive?: boolean }) => {
    const item = (
      <li className={`flex items-center transition-all duration-200 rounded-lg cursor-pointer group ${
        collapsed ? 'justify-center w-12 h-12 mx-auto' : 'justify-start space-x-3 px-3 py-2'
      } ${
        isActive 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground'
      }`}>
        <FileText className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 transition-all duration-200`} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="truncate text-sm font-medium"
            >
              {name}
            </motion.span>
          )}
        </AnimatePresence>
      </li>
    );

    return collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          {item}
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    ) : item;
  };

  return (
    <TooltipProvider>
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: collapsed ? 88 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="group/sidebar h-full bg-background/60 backdrop-blur-sm border-r border-border/60 sticky flex flex-col z-[99999] min-h-screen left-0 top-0 shadow-sm"
        style={{ overflow: 'visible' }}
      >
        {/* Collapse toggle button */}
        <div className="flex justify-end p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-8 h-8 text-muted-foreground rounded-lg hover:bg-accent/60 hover:text-foreground flex items-center justify-center transition-all duration-200"
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
        <div className="flex flex-col flex-1 px-3 space-y-6 pb-3" style={{ overflow: 'visible' }}>
          {/* User section */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} text-sm font-semibold`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer">
                    <User className="w-6 h-6 text-primary flex-shrink-0" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">john@example.com</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary flex-shrink-0" />
                </div>
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    <div className="text-foreground">John Doe</div>
                    <div className="text-xs text-muted-foreground">john@example.com</div>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <SidebarButton icon={Search} label="Search" />
            <SidebarButton 
              icon={Plus} 
              label="New Page" 
              onClick={() => console.log('New page')}
            />
            <SidebarButton icon={Trash} label="Trash" />
          </div>

          {/* Workspaces section */}
          <div className="flex-1 space-y-3">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    Workspaces
                  </motion.span>
                )}
              </AnimatePresence>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`${collapsed ? 'w-12 h-12' : 'w-6 h-6'} rounded-lg hover:bg-accent/60 hover:text-foreground text-muted-foreground flex items-center justify-center transition-all duration-200`}
                    onClick={() => console.log('Add workspace')}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>Add workspace</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <ul className="space-y-1">
              {["My Workspace", "Team Project", "Personal"].map((workspace, i) => (
                <WorkspaceItem key={i} name={workspace} index={i} isActive={i === 0} />
              ))}
            </ul>
          </div>

          {/* Pages section */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    Recent Pages
                  </motion.span>
                )}
              </AnimatePresence>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`${collapsed ? 'w-12 h-12' : 'w-6 h-6'} rounded-lg hover:bg-accent/60 hover:text-foreground text-muted-foreground flex items-center justify-center transition-all duration-200`}
                    onClick={() => console.log('New page')}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>New page</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <ul className="space-y-1">
              {["Getting Started", "Project Notes", "Meeting Minutes"].map((page, i) => (
                <PageItem key={i} name={page} index={i} isActive={i === 1} />
              ))}
            </ul>
          </div>

          {/* Footer actions */}
          <div className="mt-auto pt-4 border-t border-border/60">
            <SidebarButton 
              icon={Settings} 
              label="Settings" 
              onClick={() => console.log('Settings')}
            />
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default DashboardSidebar;