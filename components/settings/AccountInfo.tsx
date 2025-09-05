"use client"

import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { FC } from "react";

const AccountInfo: FC = () => {
    const { user } = useUser()
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-semibold mb-1">Account Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Manage your account information and preferences
                </p>
            </div>

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
                    defaultValue={user?.emailAddresses[0]?.emailAddress || "john.doe@example.com"}
                    className="w-full px-3 py-2 border rounded-lg bg-background/50 focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
        </motion.div>
    )
}

export default AccountInfo