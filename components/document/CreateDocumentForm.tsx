"use client";

import { FC, useState, useRef, ChangeEvent } from "react";
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
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Palette,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { documentTemplates } from "../templates/documentTemplates";
import { EmojiPicker } from "./EmojiPicker";
import { backgroundImages } from "./background-images";
import { useRouter } from "next/navigation";
import PublishPage from "./PublishPage";
import { useToast } from "@/hooks/use-toast";

const CreateDocumentForm: FC = () => {
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📝");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const createPage = useMutation(api.pages.createPage);
  const editorRef = useRef<HTMLDivElement>(null);
  const templates = useQuery(api.templates.listByUser, {
    userId: user?.id!
  });

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

  const handleRandomBackground = () => {
    const width = 1920;
    const height = 1080;
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/id/${randomId}/${width}/${height}`;
    setBackgroundImage(url);
    setShowBackgroundPicker(false);
  };

  // TODO: Add custom type later
  const handleTemplateSelect = (template: any) => {
    setDocumentTitle(template.title);
    setSelectedEmoji(template.emoji);
    setEditorContent(template.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.content;
    }
  };

  const handleSaveDocument = async () => {
    if (!user) {
      alert("You must be signed in to save a document!");
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
      toast({
        title: "New document was created",
        duration: 2000,
        className: "bg-green-800 text-white font-bold text-base",
      });
    } catch (err) {
      console.error("Error saving document:", err);
      toast({
        title: "New document was not created",
        duration: 2000,
        className: "bg-red-800 text-white font-bold text-base",
      });
    }
  };

  const handleBackToDashboard = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/dashboard");
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertElement = (elementType: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    let element: HTMLElement | HTMLAnchorElement | HTMLImageElement | HTMLIFrameElement;

    switch (elementType) {
      case "h1":
        element = document.createElement("h1");
        element.textContent = prompt("Heading 1 text:", "Heading 1") || "Heading 1";
        element.style.fontSize = "2rem";
        element.style.fontWeight = "bold";
        element.style.margin = "1rem 0";
        element.style.color = "inherit";
        break;
      case "h2":
        element = document.createElement("h2");
        element.textContent = prompt("Heading 2 text:", "Heading 2") || "Heading 2";
        element.style.fontSize = "1.5rem";
        element.style.fontWeight = "bold";
        element.style.margin = "0.8rem 0";
        element.style.color = "inherit";
        break;
      case "h3":
        element = document.createElement("h3");
        element.textContent = prompt("Heading 3 text:", "Heading 3") || "Heading 3";
        element.style.fontSize = "1.2rem";
        element.style.fontWeight = "bold";
        element.style.margin = "0.6rem 0";
        element.style.color = "inherit";
        break;
      case "blockquote":
        element = document.createElement("blockquote");
        element.textContent = prompt("Quote text:", "Quote text") || "Quote text";
        element.style.borderLeft = "4px solid #e5e7eb";
        element.style.paddingLeft = "1rem";
        element.style.margin = "1rem 0";
        element.style.fontStyle = "italic";
        element.style.color = "#6b7280";
        break;
      case "code":
        element = document.createElement("code");
        element.textContent = prompt("Code snippet:", "Code block") || "Code block";
        element.style.background = "#f3f4f6";
        element.style.padding = "0.2rem 0.4rem";
        element.style.borderRadius = "4px";
        element.style.fontFamily = "monospace";
        element.style.color = "#1f2937";
        break;
      case "link":
        const url = prompt("Enter URL:") as any;
        const linkText = prompt("Link text:", url) || url;
        if (!url) return;
        element = document.createElement("a");
        (element as HTMLAnchorElement).href = url;
        element.textContent = linkText;
        (element as HTMLAnchorElement).target = "_blank";
        element.style.color = "#3b82f6";
        element.style.textDecoration = "underline";
        break;
      case "image":
        const imgUrl = prompt("Image URL:");
        if (!imgUrl) return;
        element = document.createElement("img");
        (element as HTMLImageElement).src = imgUrl;
        (element as HTMLImageElement).alt = "Inserted Image";
        element.style.maxWidth = "100%";
        element.style.display = "block";
        element.style.margin = "1rem 0";
        break;
      case "video":
        const videoUrl = prompt("Video URL (YouTube embed link):");
        if (!videoUrl) return;
        element = document.createElement("iframe");
        (element as HTMLIFrameElement).src = videoUrl;
        (element as HTMLIFrameElement).width = "560";
        (element as HTMLIFrameElement).height = "315";
        (element as HTMLIFrameElement).allowFullscreen = true;
        element.style.display = "block";
        element.style.margin = "1rem 0";
        break;
      default:
        return;
    }

    range.deleteContents();
    range.insertNode(element);
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
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
                onClick={handleSaveDocument}
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
                  onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
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
              className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-muted-foreground"
            />
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background/95 backdrop-blur-sm rounded-xl border overflow-hidden mb-6"
        >
          <AnimatePresence>
            {showToolbar && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b bg-background/50 backdrop-blur-sm p-4">
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button onClick={() => formatText("bold")} className="p-2 rounded hover:bg-accent transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                    <button onClick={() => formatText("italic")} className="p-2 rounded hover:bg-accent transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                    <button onClick={() => formatText("underline")} className="p-2 rounded hover:bg-accent transition-colors" title="Underline"><Underline className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button onClick={() => insertElement("h1")} className="p-2 rounded hover:bg-accent transition-colors" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
                    <button onClick={() => insertElement("h2")} className="p-2 rounded hover:bg-accent transition-colors" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                    <button onClick={() => insertElement("h3")} className="p-2 rounded hover:bg-accent transition-colors" title="Heading 3"><Heading3 className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button onClick={() => formatText("insertUnorderedList")} className="p-2 rounded hover:bg-accent transition-colors" title="Bullet List"><List className="w-4 h-4" /></button>
                    <button onClick={() => formatText("insertOrderedList")} className="p-2 rounded hover:bg-accent transition-colors" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                    <button onClick={() => insertElement("blockquote")} className="p-2 rounded hover:bg-accent transition-colors" title="Quote"><Quote className="w-4 h-4" /></button>
                    <button onClick={() => insertElement("code")} className="p-2 rounded hover:bg-accent transition-colors" title="Code"><Code className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button onClick={() => formatText("justifyLeft")} className="p-2 rounded hover:bg-accent transition-colors" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                    <button onClick={() => formatText("justifyCenter")} className="p-2 rounded hover:bg-accent transition-colors" title="Align Center"><AlignCenter className="w-4 h-4" /></button>
                    <button onClick={() => formatText("justifyRight")} className="p-2 rounded hover:bg-accent transition-colors" title="Align Right"><AlignRight className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center space-x-1 border-r pr-4">
                    <button onClick={() => insertElement("link")} className="p-2 rounded hover:bg-accent transition-colors" title="Insert Link">🔗</button>
                    <button onClick={() => insertElement("image")} className="p-2 rounded hover:bg-accent transition-colors" title="Insert Image">🖼️</button>
                    <button onClick={() => insertElement("video")} className="p-2 rounded hover:bg-accent transition-colors" title="Insert Video">🎬</button>
                  </div>

                  <div className="relative">
                    <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-2 rounded hover:bg-accent transition-colors" title="Text Color"><Palette className="w-4 h-4" /></button>
                    <AnimatePresence>
                      {showColorPicker && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-full mt-2 w-40 p-2 bg-popover border rounded-lg shadow-lg z-50">
                          <input type="color" value={selectedColor} onChange={(e) => { setSelectedColor(e.target.value); formatText("foreColor", e.target.value); }} className="w-full h-8 p-0 border-none cursor-pointer" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={editorRef}
            onInput={handleEditorChange}
            contentEditable
            className="min-h-[300px] p-6 focus:outline-none bg-transparent"
          />
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {documentTemplates.map((template, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleTemplateSelect(template)}
              className="p-4 border rounded-lg text-left hover:bg-accent transition-colors"
            >
              <span className="text-2xl">{template.emoji}</span>
              <h3 className="font-semibold mt-2">{template.title}</h3>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {templates && templates.map((template, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleTemplateSelect(template)}
              className="p-4 border rounded-lg text-left hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mt-2">{template.name}</h3>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CreateDocumentForm;
