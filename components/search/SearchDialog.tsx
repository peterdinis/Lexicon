import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Folder, Plus, Search, Settings } from "lucide-react";
import { motion } from "framer-motion";

type SearchDialogProps = {
    searchOpen: boolean;
    setSearchOpen: (searchOpen: boolean) => void;
}

const SearchDialog: FC<SearchDialogProps> = ({
    searchOpen,
    setSearchOpen
}) => {
    return (
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
    )
}

export default SearchDialog