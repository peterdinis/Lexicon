import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Folder } from "lucide-react";
import {motion} from "framer-motion"
import { Button } from "../ui/button";

type WorkspaceDialogProps = {
    workspaceOpen: boolean;
    setWorkspaceOpen: (workspaceOpen: boolean) => void
}

const WorkspaceDialog: FC<WorkspaceDialogProps> = ({
    setWorkspaceOpen,
    workspaceOpen
}) => {
    return (
        <Dialog open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
        <DialogContent className="max-w-md">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Create Workspace</DialogTitle>
              <DialogDescription>Start a new workspace for your team or project</DialogDescription>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Workspace Name</label>
              <input
                type="text"
                placeholder="e.g., Marketing Team, Project Alpha..."
                className="w-full px-4 py-3 border rounded-xl bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Description (Optional)</label>
              <textarea
                placeholder="What's this workspace for?"
                className="w-full px-4 py-3 border rounded-xl bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setWorkspaceOpen(false)}>
                Cancel
              </Button>
              <Button className="px-6">
                Create Workspace
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
}

export default WorkspaceDialog