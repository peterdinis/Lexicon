"use client";

import { FC, ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

type TransitionProviderProps = {
  children: ReactNode;
};

const TransitionProvider: FC<TransitionProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    handleStart();

    const timer = setTimeout(() => {
      handleComplete();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="flex flex-col items-center space-y-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-blue-500 rounded-full animate-spin"
              />
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-neutral-600 dark:text-neutral-400"
              >
                Loading...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1], // Vylepšená easing funkcia
          }}
          className="h-full" // Pridané pre lepšie vyplnenie priestoru
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TransitionProvider;
