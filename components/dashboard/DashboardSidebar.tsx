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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useClerk, useUser } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import WorkspaceItem from "../workspaces/WorkspaceItem";
import WorkspaceDialog from "../workspaces/WorkspaceDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const DashboardSidebar: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  const [searchOpen, setSearchOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const workspaces = useQuery(api.workspaces.list);

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
        className={`flex items-center justify-center ${
          collapsed ? "w-12 h-12" : "justify-start space-x-3 px-3 py-2"
        } text-sm transition-all duration-200 rounded-lg group relative ${
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
        } ${className}`}
      >
        <Icon
          className={`${
            collapsed ? "w-5 h-5" : "w-4 h-4"
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

  const PageItem = ({
    name,
    index,
    isActive = false,
  }: {
    name: string;
    index: number;
    isActive?: boolean;
  }) => {
    const item = (
      <li
        className={`flex items-center transition-all duration-200 rounded-lg cursor-pointer group ${
          collapsed
            ? "justify-center w-12 h-12 mx-auto"
            : "justify-start space-x-3 px-3 py-2"
        } ${
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
        }`}
      >
        <FileText
          className={`${
            collapsed ? "w-5 h-5" : "w-4 h-4"
          } flex-shrink-0 transition-all duration-200`}
        />
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
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      item
    );
  };

  return (
    <TooltipProvider>
      {/* ---- Dialogs ---- */}

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
          <div className="flex flex-col">
            {/* Search Header */}
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    Search Everything
                  </DialogTitle>
                  <DialogDescription>
                    Find pages, workspaces, and content across your account
                  </DialogDescription>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for pages, workspaces, or content..."
                  className="w-full pl-10 pr-4 py-3 border rounded-xl bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 max-h-96">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {["project notes", "meeting minutes", "team workspace"].map(
                      (search, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/60 cursor-pointer group"
                        >
                          <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {search}
                          </span>
                        </motion.div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
                    {[
                      {
                        icon: Plus,
                        label: "Create new page",
                        desc: "Start writing",
                      },
                      {
                        icon: Folder,
                        label: "Create workspace",
                        desc: "Organize your work",
                      },
                      {
                        icon: Settings,
                        label: "Open settings",
                        desc: "Manage preferences",
                      },
                    ].map((action, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i + 3) * 0.05 }}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/60 cursor-pointer group"
                      >
                        <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                          <action.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium group-hover:text-foreground transition-colors">
                            {action.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {action.desc}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trash Dialog */}
      <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0">
          <div className="flex flex-col">
            {/* Trash Header */}
            <div className="p-6 pb-4 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Trash className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold">
                      Trash
                    </DialogTitle>
                    <DialogDescription>
                      Items deleted in the last 30 days
                    </DialogDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Empty Trash
                </Button>
              </div>
            </div>

            {/* Trash Items */}
            <div className="flex-1 overflow-y-auto p-6 max-h-96">
              <div className="space-y-3">
                {[
                  {
                    name: "Old Meeting Notes",
                    type: "Page",
                    deletedDate: "2 days ago",
                    icon: FileText,
                  },
                  {
                    name: "Draft Project Plan",
                    type: "Page",
                    deletedDate: "5 days ago",
                    icon: FileText,
                  },
                  {
                    name: "Archived Workspace",
                    type: "Workspace",
                    deletedDate: "1 week ago",
                    icon: Folder,
                  },
                  {
                    name: "Brainstorming Session",
                    type: "Page",
                    deletedDate: "2 weeks ago",
                    icon: FileText,
                  },
                  {
                    name: "Client Feedback",
                    type: "Page",
                    deletedDate: "3 weeks ago",
                    icon: FileText,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-accent/30 group transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-lg ${item.type === "Workspace" ? "bg-blue-500/10" : "bg-gray-500/10"}`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${item.type === "Workspace" ? "text-blue-500" : "text-gray-500"}`}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.type} • Deleted {item.deletedDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs"
                      >
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs text-red-500 hover:text-red-600"
                      >
                        Delete Forever
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Workspace Dialog */}
      <WorkspaceDialog
        workspaceOpen={workspaceOpen}
        setWorkspaceOpen={setWorkspaceOpen}
      />

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
          <div className="flex">
            {/* Settings Sidebar */}
            <div className="w-64 border-r border-border/60 bg-accent/20">
              <div className="p-6 pb-4 border-b border-border/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold">
                      Settings
                    </DialogTitle>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <nav className="space-y-1">
                  {[
                    { icon: User, label: "Account", active: true },
                    { icon: Settings, label: "Preferences" },
                    { icon: FileText, label: "Editor" },
                    { icon: Folder, label: "Workspaces" },
                  ].map((item, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        item.active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 max-h-96">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Account Settings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Manage your account information and preferences
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.firstName || "John"}
                          className="w-full px-3 py-2 border rounded-lg bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.lastName || "Doe"}
                          className="w-full px-3 py-2 border rounded-lg bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={
                          user?.emailAddresses[0]?.emailAddress ||
                          "john.doe@example.com"
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="border-t border-border/60 pt-6">
                      <h4 className="font-medium mb-4">Preferences</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">Dark Mode</div>
                            <div className="text-xs text-muted-foreground">
                              Switch between light and dark themes
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Toggle
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              Email Notifications
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Receive updates via email
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Enabled
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">Auto Save</div>
                            <div className="text-xs text-muted-foreground">
                              Automatically save your work
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            On
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border/60">
                      <Button
                        variant="outline"
                        onClick={() => setSettingsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
        <div
          className="flex flex-col flex-1 px-3 space-y-6 pb-3"
          style={{ overflow: "visible" }}
        >
          {/* User section - FIXED ALIGNMENT */}
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "space-x-3"
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
                {/* Fixed avatar container with consistent sizing */}
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
                    <div className="text-xs text-muted-foreground leading-tight">
                      {user?.emailAddresses[0]?.emailAddress}
                    </div>
                    <Button
                      variant={"link"}
                      onClick={() => signOut()}
                      className="p-0 h-auto justify-start font-normal text-xs"
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
              icon={Plus}
              label="New Page"
              onClick={() => console.log("New page")}
            />
            <SidebarButton
              icon={Trash}
              label="Trash"
              onClick={() => setTrashOpen(true)}
            />
          </div>

          {/* Workspaces section */}
          <div className="flex-1 space-y-3">
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
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
                    className={`${
                      collapsed ? "w-12 h-12" : "w-6 h-6"
                    } rounded-lg hover:bg-accent/60 hover:text-foreground text-muted-foreground flex items-center justify-center transition-all duration-200`}
                    onClick={() => setWorkspaceOpen(true)}
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
              {workspaces?.map((workspace, i) => (
                <div key={workspace._id}>
                  <WorkspaceItem
                    name={workspace.name}
                    index={i}
                    id={workspace._id as unknown as Id<"workspaces">}
                  />
                </div>
              ))}

              {!workspaces && (
                <p className="text-xs text-muted-foreground px-4">Loading...</p>
              )}
              {workspaces?.length === 0 && (
                <p className="text-xs text-muted-foreground px-4">
                  No workspaces yet
                </p>
              )}
            </ul>
          </div>

          {/* Pages section */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
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
                    className={`${
                      collapsed ? "w-12 h-12" : "w-6 h-6"
                    } rounded-lg hover:bg-accent/60 hover:text-foreground text-muted-foreground flex items-center justify-center transition-all duration-200`}
                    onClick={() => console.log("New page")}
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
              {["Getting Started", "Project Notes", "Meeting Minutes"].map(
                (page, i) => (
                  <PageItem key={i} name={page} index={i} isActive={i === 1} />
                ),
              )}
            </ul>
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
