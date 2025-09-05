"use client";

import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useMutation } from "convex/react";

interface NewTemplateItemProps {
  onCreated?: () => void;
}

const NewTemplateItem: FC<NewTemplateItemProps> = ({ onCreated }) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Použitie Convex useMutation hook
  const createTemplate = useMutation(api.templates.create);

  const handleCreate = async () => {
    if (!user || !name.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await createTemplate({ userId: user.id, name, content }); // <-- useMutation
      setName("");
      setContent("");
      setOpen(false);
      onCreated?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-primary font-medium px-3 py-2 rounded-lg hover:bg-accent/50 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        + New Template
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 overflow-hidden p-3 bg-muted/10 rounded-lg"
          >
            <Input
              placeholder="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewTemplateItem;
