"use client"

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { FileText, Folder, Settings, User } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import AccountInfo from "./AccountInfo";

type SettingsDialogProps = {
  settingsOpen: boolean;
  setSettingsOpen: (settingsOpen: boolean) => void;
};

const SettingsDialog: FC<SettingsDialogProps> = ({
  settingsOpen,
  setSettingsOpen,
}: SettingsDialogProps) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("account");

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Settings Sidebar */}
          <div className="w-64 border-r border-border/60 bg-accent/20">
            <div className="p-6 pb-4 border-b border-border/60">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="flex flex-col space-y-1 w-full">
                <button
                  onClick={() => setActiveTab("account")}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === "account" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-accent/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Account</span>
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === "preferences" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-accent/50"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Preferences</span>
                </button>
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === "editor" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-accent/50"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Editor</span>
                </button>
                <button
                  onClick={() => setActiveTab("workspaces")}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === "workspaces" 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-accent/50"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>Workspaces</span>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="min-h-[400px]">
                {activeTab === "account" && (
                  <AccountInfo />
                )}

                {activeTab === "preferences" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">Dark Mode</div>
                          <div className="text-xs text-muted-foreground">Switch between light and dark themes</div>
                        </div>
                        <Button variant="outline" size="sm">Toggle</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">Email Notifications</div>
                          <div className="text-xs text-muted-foreground">Receive updates via email</div>
                        </div>
                        <Button variant="outline" size="sm">Enabled</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">Auto Save</div>
                          <div className="text-xs text-muted-foreground">Automatically save your work</div>
                        </div>
                        <Button variant="outline" size="sm">On</Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "editor" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Editor Settings</h3>
                    <div className="text-sm text-muted-foreground">Editor settings go here...</div>
                  </motion.div>
                )}

                {activeTab === "workspaces" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Workspaces</h3>
                    <div className="text-sm text-muted-foreground">Workspaces settings go here...</div>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border/60">
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;