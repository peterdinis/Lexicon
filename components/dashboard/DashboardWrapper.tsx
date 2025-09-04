"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const DashboardWrapper: FC = () => {
  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4">
      <motion.div
        className="flex flex-col items-center space-y-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-10 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Nadpis */}
        <motion.h2
          className="text-2xl font-semibold"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to <span className="font-bold">Lexicon</span>
        </motion.h2>

        {/* Podtitul */}
        <motion.p
          className="text-sm text-muted-foreground max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Organize your thoughts, capture ideas, and start creating beautiful
          notes effortlessly.
        </motion.p>

        {/* Button */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button className="rounded-xl px-6 py-2 text-base shadow-md flex items-center">
            <PlusCircle className="w-5 h-5 mr-2" />
            <Link href="/pages/new">Create a new Page</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardWrapper;
