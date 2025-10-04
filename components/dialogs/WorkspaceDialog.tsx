"use client";

import { FC, useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Folder, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

type WorkspaceDialogProps = {
  workspaceOpen: boolean;
  setWorkspaceOpen: (workspaceOpen: boolean) => void;
};

const WorkspaceDialog: FC<WorkspaceDialogProps> = ({
  setWorkspaceOpen,
  workspaceOpen,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name is required",
        duration: 2000,
        className: "bg-red-800 text-white font-bold text-base",
      });
      return;
    }

    setIsLoading(true);

    try {

      toast({
        title: "Workspace was created",
        duration: 2000,
        className: "bg-green-800 text-white font-bold text-base",
      });

      setName("");
      setDescription("");
      setWorkspaceOpen(false);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast({
        title: "Failed to create workspace",
        duration: 2000,
        className: "bg-red-800 text-white font-bold text-base",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      setDescription("");
      setWorkspaceOpen(false);
    }
  };

  return (
    <Dialog open={workspaceOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Folder className="w-6 h-6 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-xl font-semibold">
              Create Workspace
            </DialogTitle>
            <DialogDescription>
              Start a new workspace for your team or project
            </DialogDescription>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Workspace Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Marketing Team, Project Alpha..."
              className="w-full px-4 py-3 border rounded-xl bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={100}
              required
            />
            {name.length > 90 && (
              <p className="text-xs text-muted-foreground mt-1">
                {100 - name.length} characters remaining
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Description (Optional)
            </label>
            <textarea
              placeholder="What's this workspace for?"
              className="w-full px-4 py-3 border rounded-xl bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none disabled:opacity-50"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              maxLength={500}
            />
            {description.length > 450 && (
              <p className="text-xs text-muted-foreground mt-1">
                {500 - description.length} characters remaining
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceDialog;
