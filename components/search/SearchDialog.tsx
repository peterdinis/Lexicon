"use client";

import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Folder, Search, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

type SearchDialogProps = {
  searchOpen: boolean;
  setSearchOpen: (searchOpen: boolean) => void;
};

const SearchDialog: FC<SearchDialogProps> = ({ searchOpen, setSearchOpen }) => {
  const [searchText, setSearchText] = useState("");
  const user = useUser();

  const results = useQuery(api.search.searchAll, {
    userId: user.user?.id!,
    searchText,
  });

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <div className="flex flex-col">
          {/* Header */}
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

            {/* Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for pages, workspaces, or content..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 max-h-96">
            <div className="space-y-6">
              {results ? (
                <>
                  {/* Pages */}
                  {results.pages.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Pages
                      </h3>
                      <div className="space-y-1">
                        {results.pages.map((page, i) => (
                          <motion.div
                            key={page._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/60 cursor-pointer group"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground">
                              {page.title}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workspaces */}
                  {results.workspaces.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Workspaces
                      </h3>
                      <div className="space-y-1">
                        {results.workspaces.map((ws, i) => (
                          <motion.div
                            key={ws._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/60 cursor-pointer group"
                          >
                            <Folder className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground">
                              {ws.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
