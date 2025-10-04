"use client";

import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  FolderPlus,
  Search,
  Lightbulb,
  Brain,
  Notebook,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import { useModalStore } from "@/store/modalStore";

const DashboardWrapper: FC = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const { setOpenModal } = useModalStore();

  const tips = [
    "Tip: Use templates to quickly create structured documents",
    "Tip: Organize related pages into workspaces for better productivity",
    "Tip: Use the search feature to quickly find your notes",
    "Tip: Try different page formats for different types of content",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10 blur-xl"
            style={{
              background: "linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899)",
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              top: `${20 + i * 15}%`,
              left: `${i * 20}%`,
            }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5 blur-xl"
            style={{
              background: "linear-gradient(45deg, #10b981, #06b6d4, #0ea5e9)",
              width: `${150 + i * 80}px`,
              height: `${150 + i * 80}px`,
              bottom: `${10 + i * 10}%`,
              right: `${i * 15}%`,
            }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, -180, -360] }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
            width: `${4 + Math.random() * 4}px`,
            height: `${4 + Math.random() * 4}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
            animationDelay: `${i * 0.2}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}

      <motion.div
        className="flex flex-col items-center space-y-8 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden border border-white/20 dark:border-neutral-700/30"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 dark:via-neutral-700/10 to-transparent -skew-x-12 animate-pulse-shimmer" />

        <div className="absolute top-0 left-0 w-16 h-16">
          <div className="absolute top-2 left-2 w-2 h-2 bg-primary rounded-full animate-ping opacity-75" />
          <div className="absolute top-2 left-8 w-1 h-1 bg-pink-500 rounded-full" />
          <div className="absolute top-8 left-2 w-1 h-1 bg-blue-500 rounded-full" />
        </div>

        <div className="absolute top-0 right-0 w-16 h-16">
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute top-2 right-8 w-1 h-1 bg-pink-500 rounded-full animate-pulse" />
          <div className="absolute top-8 right-2 w-1 h-1 bg-blue-500 rounded-full" />
        </div>

        <div className="absolute bottom-0 left-0 w-16 h-16">
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute bottom-2 left-8 w-1 h-1 bg-pink-500 rounded-full" />
          <div className="absolute bottom-8 left-2 w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
        </div>

        <div className="absolute bottom-0 right-0 w-16 h-16">
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping opacity-75" />
          <div className="absolute bottom-2 right-8 w-1 h-1 bg-pink-500 rounded-full" />
          <div className="absolute bottom-8 right-2 w-1 h-1 bg-blue-500 rounded-full" />
        </div>

        <motion.div
          className="relative mb-2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-full animate-pulse" />
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Notebook className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-star"
              style={{
                top: `${Math.random() * 60 - 30}px`,
                left: `${Math.random() * 60 - 30}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`,
              }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/30" />
            </div>
          ))}
        </motion.div>

        <motion.h2
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to Lexicon
        </motion.h2>

        <motion.p
          className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Organize your thoughts, capture ideas, and create beautiful notes with
          ease. Your second brain starts here.
        </motion.p>

        <motion.div
          className="w-full bg-primary/5 rounded-xl p-3 border border-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0 animate-pulse" />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTip}
                className="text-xs text-left text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {tips[currentTip]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-3 w-full mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="rounded-xl py-5 text-base shadow-md flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 hover:shadow-lg"
              size="lg"
            >
              <PlusCircle className="w-5 h-5" />
              New Page
              <Zap className="w-4 h-4 ml-auto opacity-70" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setOpenModal("workspace")}
                variant="outline"
                className="rounded-xl py-4 h-auto flex flex-col items-center justify-center gap-2 w-full transition-all duration-300 hover:shadow-md"
                size="lg"
              >
                <FolderPlus className="w-5 h-5" />
                <span className="text-xs">Workspace</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setOpenModal("search")}
                variant="outline"
                className="rounded-xl py-4 h-auto flex flex-col items-center justify-center gap-2 w-full transition-all duration-300 hover:shadow-md"
                size="lg"
              >
                <Search className="w-5 h-5" />
                <span className="text-xs">Search</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="pt-4 border-t border-border/40 w-full mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Brain className="w-3 h-3 animate-pulse" />
            Your ideas deserve a beautiful home
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardWrapper;
