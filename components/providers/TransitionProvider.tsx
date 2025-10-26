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
  const [currentChildren, setCurrentChildren] = useState(children);

  useEffect(() => {
    // Keď sa zmení pathname, spusti loading
    setIsLoading(true);
    
    // Aktualizuj children a až potom skry loading
    setCurrentChildren(children);
    
    // Skry loading po krátkom čase alebo keď sa obsah načíta
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-neutral-900 z-50 flex items-center justify-center"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-3 border-neutral-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" onExitComplete={() => setIsLoading(false)}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {currentChildren}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TransitionProvider;