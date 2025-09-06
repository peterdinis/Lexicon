"use client";

import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: string;
}

const mockFiles: FileItem[] = [
  { id: "1", name: "Project Proposal.pdf", type: "pdf" },
  { id: "2", name: "Resume.docx", type: "doc" },
  { id: "3", name: "Budget.xlsx", type: "xls" },
  { id: "4", name: "Presentation.pptx", type: "ppt" },
  { id: "5", name: "Design Mockup.png", type: "image" },
  { id: "6", name: "Notes.txt", type: "txt" },
];

const FilesWrapper: FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <AnimatePresence>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {mockFiles.map((file) => (
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

              {/* File Name */}
              <span className="truncate text-sm font-medium text-center">
                {file.name}
              </span>

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
