"use client";

import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { FC, useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const PublishedPageDetail: FC = () => {
  const params = useParams();
  const pageId = params.id as Id<"pages">;
  const page = useQuery(api.pages.getPageById, { id: pageId });

  const editorRef = useRef<HTMLDivElement>(null);

  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📄");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    if (page) {
      setDocumentTitle(page.title);
      setSelectedEmoji(page.icon || "📄");
      setBackgroundImage(page.coverImage || "");
      setEditorContent(page.content || "");
      if (editorRef.current) {
        editorRef.current.innerHTML = page.content || "";
      }
    }
  }, [page]);

  if (!page) return <Loader2 className="animate-spin w-8 h-8" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Background Image */}
      <AnimatePresence>
        {backgroundImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.3)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <span className="text-4xl">{selectedEmoji}</span>
          <h1 className="text-3xl font-bold">{documentTitle}</h1>
        </div>

        {/* Publication Status */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mt-4"
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
              <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                This page is published and publicly accessible
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Editor / Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background/95 border rounded-xl p-6"
        >
          <div
            ref={editorRef}
            className="min-h-[400px] leading-relaxed max-w-none bg-transparent text-foreground"
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "inherit",
              backgroundColor: "transparent",
            }}
            dangerouslySetInnerHTML={{ __html: editorContent }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PublishedPageDetail;
