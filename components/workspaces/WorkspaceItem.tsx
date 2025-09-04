"use client"

import { motion, AnimatePresence } from "framer-motion";
import { Folder } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

const WorkspaceItem = ({
    name,
    isActive = false,
    collapsed = false,
    id,
}: {
    id: Id<"documents">,
    name: string;
    index: number;
    isActive?: boolean;
    collapsed?: boolean;
}) => {
    const item = (
        <li
            className={`flex items-center transition-all duration-200 rounded-lg cursor-pointer group ${collapsed ? "justify-center w-12 h-12 mx-auto" : "justify-start space-x-3 px-3 py-2"
                } ${isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                }`}
        >
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
                            <Link href={`/workspace/${id}`}>{name}</Link>
                        </motion.span>
                    </AnimatePresence>
                </>
            )}
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

export default WorkspaceItem