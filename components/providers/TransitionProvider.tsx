"use client";

import { FC, ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

type TransitionProviderProps = {
  children: ReactNode;
};

const TransitionProvider: FC<TransitionProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Pridáme event listenery pre router events
    window.addEventListener("beforeunload", handleStart);

    const timer = setTimeout(handleComplete, 500); // Fallback timeout

    return () => {
      window.removeEventListener("beforeunload", handleStart);
      clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-neutral-900 z-50 flex items-center justify-center pointer-events-none"
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-6 h-6 border-2 border-neutral-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TransitionProvider;
