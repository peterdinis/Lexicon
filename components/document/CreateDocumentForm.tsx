"use client";

import { FC, useState, useRef, ChangeEvent, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { EmojiPicker } from "./EmojiPicker";
import { backgroundImages } from "./background-images";
import { useRouter } from "next/navigation";
import PublishPage from "./PublishPage";
import { useToast } from "@/hooks/use-toast";
import "highlight.js/styles/github-dark.css";
import { RichTextEditor } from "./RichTextEditor";

const AUTO_SAVE_INTERVAL = 5000; // 5 sekúnd

const CreateDocumentForm: FC = () => {
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📝");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [showToolbar, setShowToolbar] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const createPage = useMutation(api.pages.createPage);
  const editorRef = useRef<HTMLDivElement>(null);
  const templates = useQuery(api.templates.listByUser, {
    userId: user?.id!,
  });

  // AUTO SAVE
  useEffect(() => {
    const interval = setInterval(() => {
      if (editorContent) {
        handleSaveDocument(true); // true = autosave
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [editorContent]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
        setShowBackgroundPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const fixedEditorContent = useMemo(() => {
  // odstráň HTML značky a entity
  const plainText = editorContent
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ");

  return plainText
    .split(/\s+/) // rozdelí podľa medzier
    .map((word) => word.split("").reverse().join("")) // otočí každé slovo
    .join(" "); // znova spojí s medzerami
}, [editorContent]);

  const handleRandomBackground = () => {
    const width = 1920;
    const height = 1080;
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/id/${randomId}/${width}/${height}`;
    setBackgroundImage(url);
    setShowBackgroundPicker(false);
  };

  const handleTemplateSelect = (template: any) => {
    setDocumentTitle(template.title || template.name);
    setSelectedEmoji(template.emoji || "📝");
    const content = template.content || "";
    setEditorContent(content);
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      editorRef.current.style.direction = "ltr"; // LTR aj tu
    }
  };

  const handleSaveDocument = async (isAutoSave = false) => {
    if (!user) {
      if (!isAutoSave) {
        toast({
          title: "You must be logged in to save document",
          duration: 2000,
          className: "bg-red-800 text-white font-bold text-base",
        });
      }
      return;
    }

    try {
      await createPage({
        title: documentTitle || "Untitled Document",
        userId: user.id,
        isArchived: false,
        parentPage: undefined,
        content: editorContent,
        coverImage: backgroundImage || undefined,
        icon: selectedEmoji,
        isPublished: false,
        workspaceId: undefined,
      });
      if (!isAutoSave) {
        toast({
          title: "New document was created",
          duration: 2000,
          className: "bg-green-800 text-white font-bold text-base",
        });
      }
    } catch (err) {
      console.error("Error saving document:", err);
      if (!isAutoSave) {
        toast({
          title: "New document was not created",
          duration: 2000,
          className: "bg-red-800 text-white font-bold text-base",
        });
      }
    }
  };

  const handleBackToDashboard = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/dashboard");
    }
  };

  const onSaveDraft = () => {
    console.log("DO NOTHING FOR NOW");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
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

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`relative z-50 p-6 ${backgroundImage ? "text-white" : ""}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent/60 transition-colors border backdrop-blur-sm bg-background/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </motion.button>
              <h1 className="text-2xl font-bold">Create New Page</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowToolbar(!showToolbar)}
                className="p-2 rounded-lg hover:bg-accent/60 transition-colors backdrop-blur-sm bg-background/20"
              >
                {showToolbar ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSaveDocument(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Page</span>
              </motion.button>
              <PublishPage onSaveDraft={onSaveDraft} />
            </div>
          </div>

          <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 mb-6 border">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative z-50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-4xl p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  {selectedEmoji}
                </motion.button>

                <div className="relative z-[100]">
                  <EmojiPicker
                    selectedEmoji={selectedEmoji}
                    onSelect={(emoji) => setSelectedEmoji(emoji)}
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              </div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setShowBackgroundPicker(!showBackgroundPicker)
                  }
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span>Background</span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showBackgroundPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute top-full left-0 mt-2 p-4 bg-popover border rounded-lg shadow-lg z-50 min-w-[300px]"
                    >
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {backgroundImages.map((img, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => {
                              setBackgroundImage(img);
                              setShowBackgroundPicker(false);
                            }}
                            className="aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </motion.button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="w-full flex items-center justify-center space-x-2 p-2 border border-dashed rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Upload Custom Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          onClick={handleRandomBackground}
                          className="w-full flex items-center justify-center space-x-2 p-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors"
                        >
                          <span>Random Lorem Picsum</span>
                        </button>

                        {backgroundImage && (
                          <button
                            onClick={() => {
                              setBackgroundImage("");
                              setShowBackgroundPicker(false);
                            }}
                            className="w-full flex items-center justify-center space-x-2 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Remove Background</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Untitled Page"
              className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-muted-foreground"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background/95 backdrop-blur-sm rounded-xl border overflow-hidden mb-6"
          >
            <RichTextEditor
              content={fixedEditorContent}
              onChange={(html) => setEditorContent(html)}
            />
          </motion.div>

          {templates && templates.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {templates.map((template) => (
                <motion.button
                  key={template._id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTemplateSelect(template)}
                  className="border rounded-lg p-3 text-left hover:bg-accent transition-colors"
                >
                  <div className="text-2xl">{template.name || "📝"}</div>
                  <div className="mt-2 font-bold">{template.content}</div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateDocumentForm;
