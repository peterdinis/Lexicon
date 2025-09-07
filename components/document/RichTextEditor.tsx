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
}

export const RichTextEditor: FC<RichTextEditorProps> = ({
  content,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);

    // Sledovanie zmeny contentu zvonku
    useEffect(() => {
        if (editorRef.current && content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    const handleEditorChange = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const formatText = (command: string, value?: string) => {
        // Získanie aktuálnej pozície kurzora
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const savedSelection = saveSelection(editorRef.current!);
        
        // Vykonanie príkazu
        document.execCommand(command, false, value);
        
        // Obnovenie pozície kurzora
        if (savedSelection) {
            restoreSelection(editorRef.current!, savedSelection);
        }
        
        editorRef.current?.focus();
        handleEditorChange();
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
        let element: HTMLElement;

        // Uloženie aktuálnej pozície kurzora
        const savedSelection = saveSelection(editorRef.current);

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
                element.setAttribute("href", "#");
                element.textContent = "Link text";
                element.setAttribute("target", "_blank");
                element.style.color = "#3b82f6";
                element.style.textDecoration = "underline";
                break;
            case "image":
                element = document.createElement("img");
                element.setAttribute("src", "https://via.placeholder.com/400x200");
                element.setAttribute("alt", "Inserted Image");
                element.style.maxWidth = "100%";
                element.style.display = "block";
                element.style.margin = "1rem 0";
                break;
            case "video":
                element = document.createElement("iframe");
                element.setAttribute("src", "https://www.youtube.com/embed/dQw4w9WgXcQ");
                element.setAttribute("width", "560");
                element.setAttribute("height", "315");
                element.setAttribute("allowfullscreen", "true");
                element.style.display = "block";
                element.style.margin = "1rem 0";
                break;
            default:
                return;
        }

        range.deleteContents();
        range.insertNode(element);
        
        // Obnovenie pozície kurzora
        if (savedSelection) {
            restoreSelection(editorRef.current, savedSelection);
        }
        
        handleEditorChange();
    };

    // Funkcie pre ukladanie a obnovovanie pozície kurzora
    const saveSelection = (containerEl: HTMLElement) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(containerEl);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        
        return {
            start: preSelectionRange.toString().length,
            end: preSelectionRange.toString().length + range.toString().length
        };
    };

    const restoreSelection = (containerEl: HTMLElement, savedSel: { start: number; end: number }) => {
        const selection = window.getSelection();
        if (!selection) return;
        
        let charIndex = 0;
        const range = document.createRange();
        range.setStart(containerEl, 0);
        range.collapse(true);
        
        const nodeStack: [Node, boolean][] = [[containerEl, false]];
        let node: Node | undefined;
        let foundStart = false;
        let stop = false;
        
        while (!stop && (node = nodeStack.pop()?.[0])) {
            if (node.nodeType === Node.TEXT_NODE) {
                const nextCharIndex = charIndex + (node.textContent?.length || 0);
                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                    range.setEnd(node, savedSel.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                const children = node.childNodes;
                for (let i = children.length - 1; i >= 0; i--) {
                    nodeStack.push([children[i], false]);
                }
            }
        }
        
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
                    onBlur={handleEditorChange}
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: content }}
                    className="min-h-[300px] p-6 focus:outline-none bg-transparent"
                    suppressContentEditableWarning={true}
                    style={{ direction: "revert" }}
                />
            </ScrollArea>
        </div>
    );
};
