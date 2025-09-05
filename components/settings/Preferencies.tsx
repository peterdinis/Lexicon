"use client";

import { motion } from "framer-motion";
import { FC } from "react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";

const Preferencies: FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
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
            <div className="text-xs text-muted-foreground">
              Switch between light and dark themes
            </div>
          </div>
          <Button variant="link" size="sm" onClick={toggleDarkMode}>
            {theme === "dark" ? "Disable" : "Enable"}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Email Notifications</div>
            <div className="text-xs text-muted-foreground">
              Receive updates via email
            </div>
          </div>
          <Button variant="link" size="sm">
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
          <Button variant="link" size="sm">
            On
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Preferencies;
