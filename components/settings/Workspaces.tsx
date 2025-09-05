"use client";

import { motion } from "framer-motion";
import { FC } from "react";

const Workspaces: FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="text-lg font-semibold mb-4">Workspaces</h3>
      <div className="text-sm text-muted-foreground">
        Workspaces settings go here...
      </div>
    </motion.div>
  );
};

export default Workspaces;
