"use client";

import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { FileText, Folder, Trash, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useToast } from "@/hooks/use-toast";

type TrashItem = {
  _id: any;
  name: string;
  type: "Page" | "Workspace";
  deletedDate: string;
  icon: typeof FileText | typeof Folder;
};

type TrashDialogProps = {
  trashOpen: boolean;
  setTrashOpen: (trashOpen: boolean) => void;
};

const TrashDialog: FC<TrashDialogProps> = ({ setTrashOpen, trashOpen }) => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const getAllTrashed = useQuery(api.trash.getAllTrashed);
  const bulkDelete = useMutation(api.trash.bulkDeleteTrashed);
  const restorePage = useMutation(api.trash.restorePage);
  const restoreWorkspace = useMutation(api.trash.restoreWorkspace);
  const { toast } = useToast();

  useEffect(() => {
    if (getAllTrashed) {
      const pages: TrashItem[] = getAllTrashed.pages.map((p: any) => ({
        _id: p._id,
        name: p.title,
        type: "Page",
        deletedDate: p.deletedAt || "unknown",
        icon: FileText,
      }));

      const workspaces: TrashItem[] = getAllTrashed.workspaces.map(
        (w: any) => ({
          _id: w._id,
          name: w.name,
          type: "Workspace",
          deletedDate: w.deletedAt || "unknown",
          icon: Folder,
        }),
      );

      setItems([...pages, ...workspaces]);
    }
  }, [getAllTrashed]);

  const handleEmptyTrash = async () => {
    try {
      await bulkDelete({});
      setItems([]);
      toast({
        title: "Trash was cleaned",
        duration: 2000,
        className: "bg-green-800 text-white font-bold",
      });
    } catch (error) {
      toast({
        title: "Error cleaning trash",
        description: "Something went wrong",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleRestore = async (item: TrashItem) => {
    try {
      if (item.type === "Page") {
        await restorePage({ pageId: item._id });
      } else {
        await restoreWorkspace({ workspaceId: item._id });
      }

      // Remove restored item from local state
      setItems(items.filter((i) => i._id !== item._id));

      toast({
        title: `${item.type} restored`,
        description: `${item.name} has been restored successfully`,
        duration: 2000,
        className: "bg-green-800 text-white font-bold",
      });
    } catch (error) {
      toast({
        title: "Error restoring item",
        description: "Something went wrong while restoring the item",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0">
        <div className="flex flex-col">
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
              <Button
                variant="ghost"
                size="sm"
                className="text-xs mt-3"
                onClick={handleEmptyTrash}
                disabled={items.length === 0}
              >
                Empty Trash
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 max-h-96">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Trash className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Trash is empty
                </h3>
                <p className="text-sm text-gray-500">
                  No deleted items to display
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-accent/30 group transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-lg ${
                          item.type === "Workspace"
                            ? "bg-blue-500/10"
                            : "bg-gray-500/10"
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            item.type === "Workspace"
                              ? "text-blue-500"
                              : "text-gray-500"
                          }`}
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

                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => handleRestore(item)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrashDialog;
