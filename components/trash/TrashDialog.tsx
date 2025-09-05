"use client"

import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { FileText, Folder, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

type TrashItem = {
  _id: string;
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

  useEffect(() => {
    if (getAllTrashed) {
      const pages: TrashItem[] = getAllTrashed.pages.map((p: any) => ({
        _id: p._id,
        name: p.title,
        type: "Page",
        deletedDate: p.deletedAt || "unknown",
        icon: FileText,
      }));

      const workspaces: TrashItem[] = getAllTrashed.workspaces.map((w: any) => ({
        _id: w._id,
        name: w.name,
        type: "Workspace",
        deletedDate: w.deletedAt || "unknown",
        icon: Folder,
      }));

      setItems([...pages, ...workspaces]);
    }
  }, [getAllTrashed]);

  const handleEmptyTrash = async () => {
    await bulkDelete({});
    setItems([]);
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
                  <DialogTitle className="text-lg font-semibold">Trash</DialogTitle>
                  <DialogDescription>Items deleted in the last 30 days</DialogDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={handleEmptyTrash}>
                Empty Trash
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 max-h-96">
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
                        item.type === "Workspace" ? "bg-blue-500/10" : "bg-gray-500/10"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${
                          item.type === "Workspace" ? "text-blue-500" : "text-gray-500"
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrashDialog;
