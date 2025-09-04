import { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { FileText, Folder, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

type TrashDialogProps = {
    trashOpen: boolean;
    setTrashOpen: (trashOpen: boolean) => void
}

const TrashDialog: FC<TrashDialogProps> = ({
    setTrashOpen,
    trashOpen
}) => {
    return (
        <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0">
                <div className="flex flex-col">
                    {/* Trash Header */}
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
                            <Button variant="outline" size="sm" className="text-xs">
                                Empty Trash
                            </Button>
                        </div>
                    </div>

                    {/* Trash Items */}
                    <div className="flex-1 overflow-y-auto p-6 max-h-96">
                        <div className="space-y-3">
                            {[
                                {
                                    name: "Old Meeting Notes",
                                    type: "Page",
                                    deletedDate: "2 days ago",
                                    icon: FileText,
                                },
                                {
                                    name: "Draft Project Plan",
                                    type: "Page",
                                    deletedDate: "5 days ago",
                                    icon: FileText,
                                },
                                {
                                    name: "Archived Workspace",
                                    type: "Workspace",
                                    deletedDate: "1 week ago",
                                    icon: Folder,
                                },
                                {
                                    name: "Brainstorming Session",
                                    type: "Page",
                                    deletedDate: "2 weeks ago",
                                    icon: FileText,
                                },
                                {
                                    name: "Client Feedback",
                                    type: "Page",
                                    deletedDate: "3 weeks ago",
                                    icon: FileText,
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-accent/30 group transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className={`p-2 rounded-lg ${item.type === "Workspace" ? "bg-blue-500/10" : "bg-gray-500/10"}`}
                                        >
                                            <item.icon
                                                className={`w-5 h-5 ${item.type === "Workspace" ? "text-blue-500" : "text-gray-500"}`}
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
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-3 text-xs"
                                        >
                                            Restore
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-3 text-xs text-red-500 hover:text-red-600"
                                        >
                                            Delete Forever
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default TrashDialog