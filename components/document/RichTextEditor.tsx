"use client";

import { FC, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Palette,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { ScrollArea } from "../ui/scroll-area";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onAutoSave: (html: string) => void; // callback pre autoSave
  autoSaveDelay?: number; // voliteľná dĺžka oneskorenia pred autoSave
}

export const RichTextEditor: FC<RichTextEditorProps> = ({
  content,
  onChange,
  onAutoSave,
  autoSaveDelay = 2000,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleEditorChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);

      // AutoSave po prestaní písania
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        onAutoSave(html);
      }, autoSaveDelay);
    }
  };

  // AutoSave pri odchode zo stránky
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editorRef.current) {
        onAutoSave(editorRef.current.innerHTML);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onAutoSave]);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertElement = (
    elementType:
      | "p"
      | "h1"
      | "h2"
      | "h3"
      | "h4"
      | "h5"
      | "h6"
      | "blockquote"
      | "code"
      | "link"
      | "image"
      | "video",
  ) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    let element: any;

    switch (elementType) {
      case "p":
        element = document.createElement("p");
        element.textContent = "Your paragraph text";
        element.style.margin = "0.5rem 0";
        element.style.color = "inherit";
        break;
      case "h1":
        element = document.createElement("h1");
        element.textContent = "Heading 1";
        element.style.fontSize = "2rem";
        element.style.fontWeight = "bold";
        element.style.margin = "1rem 0";
        element.style.color = "inherit";
        break;
      case "h2":
        element = document.createElement("h2");
        element.textContent = "Heading 2";
        element.style.fontSize = "1.5rem";
        element.style.fontWeight = "bold";
        element.style.margin = "0.8rem 0";
        element.style.color = "inherit";
        break;
      case "h3":
        element = document.createElement("h3");
        element.textContent = "Heading 3";
        element.style.fontSize = "1.2rem";
        element.style.fontWeight = "bold";
        element.style.margin = "0.6rem 0";
        element.style.color = "inherit";
        break;
      case "h4":
        element = document.createElement("h4");
        element.textContent = "Heading 4";
        element.style.fontSize = "1rem";
        element.style.fontWeight = "bold";
        element.style.margin = "0.5rem 0";
        element.style.color = "inherit";
        break;
      case "h5":
        element = document.createElement("h5");
        element.textContent = "Heading 5";
        element.style.fontSize = "0.875rem";
        element.style.fontWeight = "bold";
        element.style.margin = "0.4rem 0";
        element.style.color = "inherit";
        break;
      case "h6":
        element = document.createElement("h6");
        element.textContent = "Heading 6";
        element.style.fontSize = "0.75rem";
        element.style.fontWeight = "bold";
        element.style.margin = "0.3rem 0";
        element.style.color = "inherit";
        break;
      case "blockquote":
        element = document.createElement("blockquote");
        element.textContent = "Quote text";
        element.style.borderLeft = "4px solid #e5e7eb";
        element.style.paddingLeft = "1rem";
        element.style.margin = "1rem 0";
        element.style.fontStyle = "italic";
        element.style.color = "#6b7280";
        break;
      case "code":
        element = document.createElement("pre");
        const codeEl = document.createElement("code");
        codeEl.textContent = "// your code here";
        element.appendChild(codeEl);
        element.style.margin = "1rem 0";
        element.style.borderRadius = "4px";
        element.style.background = "#1e1e1e";
        element.style.padding = "1rem";
        element.style.display = "block";
        hljs.highlightElement(codeEl);
        break;
      case "link":
        element = document.createElement("a");
        element.href = "#";
        element.textContent = "Link text";
        (element as HTMLAnchorElement).target = "_blank";
        element.style.color = "#3b82f6";
        element.style.textDecoration = "underline";
        break;
      case "image":
        element = document.createElement("img");
        (element as HTMLImageElement).src =
          "https://via.placeholder.com/400x200";
        (element as HTMLImageElement).alt = "Inserted Image";
        element.style.maxWidth = "100%";
        element.style.display = "block";
        element.style.margin = "1rem 0";
        break;
      case "video":
        element = document.createElement("iframe");
        (element as HTMLIFrameElement).src =
          "https://www.youtube.com/embed/dQw4w9WgXcQ";
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

  return (
    <div>
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-background/50 backdrop-blur-sm p-4"
          >
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center space-x-1 border-r pr-4">
                <button
                  onClick={() => formatText("bold")}
                  className="p-2 rounded hover:bg-accent"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => formatText("italic")}
                  className="p-2 rounded hover:bg-accent"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => formatText("underline")}
                  className="p-2 rounded hover:bg-accent"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-1 border-r pr-4">
                <button
                  onClick={() => insertElement("p")}
                  className="p-2 rounded hover:bg-accent"
                  title="Paragraph"
                >
                  P
                </button>
                <button
                  onClick={() => insertElement("h1")}
                  className="p-2 rounded hover:bg-accent"
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertElement("h2")}
                  className="p-2 rounded hover:bg-accent"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertElement("h3")}
                  className="p-2 rounded hover:bg-accent"
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertElement("h4")}
                  className="p-2 rounded hover:bg-accent"
                  title="Heading 4"
                >
                  H4
                </button>
                <button
                  onClick={() => insertElement("h5")}
                  className="p-2 rounded hover:bg-accent"
                  title="Heading 5"
                >
                  H5
                </button>
                <button
                  onClick={() => insertElement("h6")}
                  className="p-2 rounded hover:bg-accent"
                  title="Heading 6"
                >
                  H6
                </button>
              </div>

              <div className="flex items-center space-x-1 border-r pr-4">
                <button
                  onClick={() => formatText("insertUnorderedList")}
                  className="p-2 rounded hover:bg-accent"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => formatText("insertOrderedList")}
                  className="p-2 rounded hover:bg-accent"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertElement("blockquote")}
                  className="p-2 rounded hover:bg-accent"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertElement("code")}
                  className="p-2 rounded hover:bg-accent"
                  title="Code"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded hover:bg-accent"
                  title="Text Color"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-full mt-2 w-40 p-2 bg-popover border rounded-lg shadow-lg z-50"
                    >
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => {
                          setSelectedColor(e.target.value);
                          formatText("foreColor", e.target.value);
                        }}
                        className="w-full h-8 p-0 border-none cursor-pointer"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollArea>
        <div
          ref={editorRef}
          onInput={handleEditorChange}
          contentEditable
          dangerouslySetInnerHTML={{ __html: content }}
          className="min-h-[300px] p-6 focus:outline-none bg-transparent"
        />
      </ScrollArea>
    </div>
  );
};
