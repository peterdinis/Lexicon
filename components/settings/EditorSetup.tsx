"use client";

import { motion } from "framer-motion";
import { FC } from "react";

const EditorSetup: FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="text-lg font-semibold mb-4">Editor Settings</h3>
      <div className="text-sm text-muted-foreground">
        Editor settings go here...
      </div>
    </motion.div>
  );
};

export default EditorSetup;
