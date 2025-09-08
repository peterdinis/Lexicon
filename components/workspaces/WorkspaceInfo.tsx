"use client";

import { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  Edit3,
  Loader2,
  AlertCircle,
  FolderOpen,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WorkspaceInfoProps {
  onEdit?: () => void;
}

const WorkspaceInfo: FC<WorkspaceInfoProps> = ({ onEdit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const params = useParams();
  const router = useRouter();

  const workspaceId = params.id as Id<"workspaces">;
  const workspace = useQuery(
    api.workspaces.getById,
    workspaceId ? { id: workspaceId } : "skip",
  );

  const workspacePages = useQuery(
    api.workspaces.listPagesByWorkspace,
    workspaceId ? { workspaceId } : "skip",
  );

  const deleteWorkspace = useMutation(api.workspaces.deleteWorkspace);

  const handleDelete = async () => {
  if (!workspaceId) return;

  if (
    !confirm(
      "Are you sure you want to delete this workspace? This will also remove all its pages."
    )
  ) {
    return;
  }

  try {
    await deleteWorkspace({ id: workspaceId });
    router.push("/workspaces"); // ← správne presmerovanie
  } catch (err: any) {
    alert(err.message);
  }
};

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (workspace === undefined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center p-8"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      </motion.div>
    );
  }

  // Error state
  if (workspace === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center p-8"
      >
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>Workspace not found or access denied</span>
        </div>
      </motion.div>
    );
  }

  const pageCount = workspacePages?.length || 0;
  const createdDate = new Date(workspace._creationTime);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="space-y-6"
        >
          {/* Header Card */}
          <Card className="border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex items-start justify-between"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-primary/10 border border-primary/20"
                  >
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {workspace.name}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {workspace.description || "No description provided"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {onEdit && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.2 }}
                    >
                      <Button
                        onClick={onEdit}
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:scale-105 transition-transform"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </Button>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.2 }}
                  >
                    <Button
                      onClick={handleDelete}
                      variant="destructive"
                      size="sm"
                      className="gap-2 hover:scale-105 transition-transform"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Delete
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Pages Count */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {pageCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pageCount === 1 ? "Page" : "Pages"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Created Date */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {createdDate.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Created</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <span className="text-sm font-medium">Created at</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {createdDate.toLocaleString()}
                  </Badge>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <span className="text-sm font-medium">Last modified</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {new Date(workspace._creationTime).toLocaleString()}
                  </Badge>
                </motion.div>

                {workspace.description && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                    className="p-3 bg-muted/30 rounded-lg"
                  >
                    <span className="text-sm font-medium block mb-2">
                      Description
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {workspace.description}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Pages Preview */}
          {workspacePages && workspacePages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    Recent Pages ({pageCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workspacePages.slice(0, 5).map((page, index) => (
                      <motion.div
                        key={page._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.7 + index * 0.1,
                          duration: 0.3,
                        }}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{page.title}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {new Date(page._creationTime).toLocaleDateString()}
                        </Badge>
                      </motion.div>
                    ))}
                    {workspacePages.length > 5 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.3 }}
                        className="text-sm text-muted-foreground text-center py-2"
                      >
                        ... and {workspacePages.length - 5} more pages
                      </motion.p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkspaceInfo;
