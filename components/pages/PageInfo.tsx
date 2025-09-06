"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { EmojiPicker } from "../document/EmojiPicker";
import { backgroundImages } from "../document/background-images";
import { Id } from "@/convex/_generated/dataModel";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Image,
  Loader2,
  Lock,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const PageDetailForm: FC = () => {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const pageId = params.id as Id<"pages">;
  const page = useQuery(api.pages.getPageById, { id: pageId });
  const updatePage = useMutation(api.pages.updatePage);
  const movePage = useMutation(api.workspaces.movePageToWorkspace);
  const moveToTrash = useMutation(api.pages.moveToTrash);
  const publishPage = useMutation(api.pages.publishPage);

  const workspaces = useQuery(api.workspaces.list);

  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📄");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setDocumentTitle(page.title);
      setSelectedEmoji(page.icon || "📄");
      setBackgroundImage(page.coverImage || "");
      setEditorContent(page.content || "");
      setIsPublished(page.isPublished || false);
      if (editorRef.current) {
        editorRef.current.innerHTML = page.content || "";
      }
    }
  }, [page]);

  if (!page) return <Loader2 className="animate-spin w-8 h-8" />;

  const handleSave = async () => {
    await updatePage({
      id: pageId as any,
      title: documentTitle,
      content: editorContent,
      coverImage: backgroundImage || undefined,
      icon: selectedEmoji,
    });
    alert("Page updated successfully!");
  };

  const handlePublishToggle = async () => {
    const newPublishState = !isPublished;
    await publishPage({
      id: pageId,
      isPublished: newPublishState,
    });
    setIsPublished(newPublishState);

    if (newPublishState) {
      // Zobrazíme URL publikovanej stránky
      setPublishedUrl(`${window.location.origin}/pages/published/${pageId}`);
    } else {
      setPublishedUrl(null);
      alert("Page unpublished successfully!");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/dashboard");
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setBackgroundImage(e.target?.result as string);
      setShowBackgroundPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleWorkspaceChange = async (workspaceId: string) => {
    if (!page) return;
    await movePage({
      pageId,
      targetWorkspaceId: workspaceId as Id<"workspaces">,
    });
    alert("Page moved to new workspace!");
  };

  const handleMoveToTrash = async () => {
    if (!confirm("Are you sure you want to move this page to trash?")) return;
    await moveToTrash({ id: pageId });
    alert("Page moved to trash!");
    router.push("/dashboard");
  };

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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleBack}
            className="flex items-center bg-stone-400 space-x-2 px-3 py-2 rounded-lg hover:bg-accent/60 border"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>
          <div className="flex items-center gap-3">
            <Select
              defaultValue={page.workspaceId || ""}
              onValueChange={handleWorkspaceChange}
            >
              <SelectTrigger className="w-[200px] bg-stone-300">
                <SelectValue placeholder="Move to workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces &&
                  workspaces.map((ws) => (
                    <SelectItem key={ws._id} value={ws._id}>
                      {ws.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => setShowToolbar(!showToolbar)}
              className="p-2 rounded-lg hover:bg-accent/60"
            >
              {showToolbar ? (
                <EyeOff className="w-5 h-5 text-stone-100" />
              ) : (
                <Eye className="w-5 h-5 text-stone-100" />
              )}
            </button>

            {/* Publish/Unpublish Button */}
            <Button
              onClick={handlePublishToggle}
              variant={isPublished ? "secondary" : "default"}
              className="flex items-center space-x-2"
            >
              {isPublished ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unpublish</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Publish</span>
                </>
              )}
            </Button>

            {/* Trash Button */}
            <Button
              onClick={handleMoveToTrash}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Move to Trash</span>
            </Button>

            <Button
              onClick={handleSave}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>

        {/* Publication Status Indicator */}
        {isPublished && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mt-4 flex flex-col gap-2"
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
              <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                This page is published and publicly accessible
              </span>
            </div>
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline text-sm"
              >
                Visit Published Page
              </a>
            )}
          </motion.div>
        )}
      </div>

      {/* Document Header */}
      <div className="max-w-4xl mx-auto relative z-10 p-6 bg-background/95 border rounded-xl mb-6">
        <div className="flex items-center space-x-4 mb-6">
          {/* Emoji Picker */}
          <div className="relative z-50">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-4xl p-2 rounded-lg hover:bg-accent"
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

          {/* Background Picker */}
          <div className="relative z-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border hover:bg-accent"
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
                  className="absolute top-full left-0 mt-2 p-4 bg-popover border rounded-lg shadow-lg z-[100] min-w-[300px]"
                >
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {backgroundImages.map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setBackgroundImage(img);
                          setShowBackgroundPicker(false);
                        }}
                        className="aspect-video rounded-lg overflow-hidden border"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                  <label className="w-full flex items-center justify-center space-x-2 p-2 border border-dashed rounded-lg hover:bg-accent cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload Custom Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {backgroundImage && (
                    <button
                      onClick={() => {
                        setBackgroundImage("");
                        setShowBackgroundPicker(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 p-2 text-destructive hover:bg-destructive/10 rounded-lg mt-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove Background</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.input
          type="text"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="Page Title"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none"
        />
      </div>

      {/* Editor */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background/95 border rounded-xl p-6"
        >
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[400px] outline-none leading-relaxed max-w-none bg-transparent text-foreground"
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "inherit",
              backgroundColor: "transparent",
            }}
            onInput={handleEditorChange}
            dangerouslySetInnerHTML={{ __html: editorContent }}
            suppressContentEditableWarning
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PageDetailForm;
