"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedPageWrapperProps {
  children: ReactNode;
}

export function AnimatedPageWrapper({ children }: AnimatedPageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
