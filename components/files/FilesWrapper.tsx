"use client";

import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const FilesWrapper: FC = () => {
  const files = useQuery(api.uploads.getFiles);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <AnimatePresence>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {files &&
            files.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                }}
                className="relative bg-background/50 backdrop-blur-sm border border-border rounded-lg p-4 flex flex-col items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer"
              >
                {/* File Icon */}
                <FileText className="w-8 h-8 mb-2 text-primary" />

                {/* Optional Remove Icon (just for display) */}
                <div className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/20 transition-colors">
                  <X className="w-4 h-4 text-destructive" />
                </div>
              </motion.div>
            ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FilesWrapper;
