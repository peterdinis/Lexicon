"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { PlusCircle, FolderPlus, Search, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const DashboardWrapper: FC = () => {
  return (
    <div className="min-h-[100vh] flex items-center justify-center px-6">
      <motion.div
        className="flex flex-col items-center space-y-8 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-10 md:p-14 max-w-lg w-full text-center relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Decorative background glow */}
        <motion.div
          className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-primary via-pink-500 to-indigo-500"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Title */}
        <motion.h2
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to <span className="text-primary">Lexicon</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Organize your thoughts, capture ideas, and create beautiful notes with ease.  
          Your second brain starts here.
        </motion.p>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button asChild className="rounded-xl py-3 text-base shadow-md flex items-center justify-center gap-2">
            <Link href="/pages/new">
              <PlusCircle className="w-5 h-5" />
              New Page
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-xl py-3 text-base flex items-center justify-center gap-2">
            <Link href="/workspaces/new">
              <FolderPlus className="w-5 h-5" />
              New Workspace
            </Link>
          </Button>

          <Button asChild variant="secondary" className="rounded-xl py-3 text-base flex items-center justify-center gap-2">
            <Link href="/search">
              <Search className="w-5 h-5" />
              Search
            </Link>
          </Button>

          <Button asChild variant="ghost" className="rounded-xl py-3 text-base flex items-center justify-center gap-2">
            <Link href="/templates">
              <BookOpen className="w-5 h-5" />
              Templates
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardWrapper;
