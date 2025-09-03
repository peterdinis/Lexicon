"use client";

import React, { FC } from "react";
import { ChevronsLeft, MenuIcon, Plus, PlusCircle, Search, Settings, Trash } from "lucide-react";

const DashboardSidebar: FC = () => {
    return (
        <>
            {/* Sidebar */}
            <aside className="group/sidebar h-full bg-secondary overflow-y-auto sticky flex w-60 flex-col z-[99999] min-h-[100vh] left-0 top-0">
                {/* Collapse icon */}
                <div className="absolute top-3 right-2 w-6 h-6 text-muted-foreground rounded-sm hover:bg-neutral-300dark:hover:bg-neutral-600 opacity-0 group-hover/sidebar:opacity-100">
                    <ChevronsLeft className="w-6 h-6" />
                </div>

                {/* Sidebar actions */}
                <div>
                    TODO ACTIONS
                </div>

                {/* Document list */}
                <div className="mt-4">
                    TODO WORKSPACES LISTS
                </div>

                {/* Resize handle */}
                <div className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0" />
            </aside>

            {/* Navbar */}
            <div className="absolute top-0 left-60 z-[99999] w-[calc(100%-240px)]">
                TODO NABVBAR
                <nav className="bg-transparent px-3 py-2 w-full">
                    <MenuIcon className="w-6 h-6 text-muted-foreground" />
                </nav>
            </div>
        </>
    );
}

export default DashboardSidebar;
