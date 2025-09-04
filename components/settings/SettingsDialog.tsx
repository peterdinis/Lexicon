import { FC } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { FileText, Folder, Settings, User } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { Button } from "../ui/button";

type SettingsDialogProps = {
    settingsOpen: boolean;
    setSettingsOpen: (settingsOpen: boolean) => void
}

const SettingsDialog: FC<SettingsDialogProps> = ({
    settingsOpen,
    setSettingsOpen
}: SettingsDialogProps) => {
    const { user } = useUser()
    return (
        <>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
                    <div className="flex">
                        {/* Settings Sidebar */}
                        <div className="w-64 border-r border-border/60 bg-accent/20">
                            <div className="p-6 pb-4 border-b border-border/60">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Settings className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg font-semibold">
                                            Settings
                                        </DialogTitle>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <nav className="space-y-1">
                                    {[
                                        { icon: User, label: "Account", active: true },
                                        { icon: Settings, label: "Preferences" },
                                        { icon: FileText, label: "Editor" },
                                        { icon: Folder, label: "Workspaces" },
                                    ].map((item, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${item.active
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Settings Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 max-h-96">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">
                                            Account Settings
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-6">
                                            Manage your account information and preferences
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-2 block">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    defaultValue={user?.firstName || "John"}
                                                    className="w-full px-3 py-2 border rounded-lg bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-2 block">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    defaultValue={user?.lastName || "Doe"}
                                                    className="w-full px-3 py-2 border rounded-lg bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-2 block">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                defaultValue={
                                                    user?.emailAddresses[0]?.emailAddress ||
                                                    "john.doe@example.com"
                                                }
                                                className="w-full px-3 py-2 border rounded-lg bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                disabled
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Email cannot be changed
                                            </p>
                                        </div>

                                        <div className="border-t border-border/60 pt-6">
                                            <h4 className="font-medium mb-4">Preferences</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-sm">Dark Mode</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Switch between light and dark themes
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Toggle
                                                    </Button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            Email Notifications
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Receive updates via email
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Enabled
                                                    </Button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-sm">Auto Save</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Automatically save your work
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        On
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border/60">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSettingsOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button>Save Changes</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default SettingsDialog