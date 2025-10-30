"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { common, createLowlight } from "lowlight";
import { useEffect, useCallback, useState, useTransition } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  CheckSquare,
  Image as ImageIcon,
  Link2,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline as UnderlineIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePageHandler } from "@/actions/pagesActions";

// Lazy load languages
const loadLanguage = async (lang: string) => {
  try {
    const module = await import(`highlight.js/lib/languages/${lang}`);
    return module.default;
  } catch (err) {
    console.warn(`Failed to load language: ${lang}`);
    return null;
  }
};

const lowlight = createLowlight(common);

// Pre-register common languages in background
const PRELOAD_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "php",
  "css",
  "json",
];

// Language options
const LANGUAGE_OPTIONS = [
  { value: "text", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "php", label: "PHP" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "bash", label: "Bash" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
];

interface TiptapEditorProps {
  pageId: string;
  initialContent?: string;
  onUpdate?: (content: string) => void;
}

export function TiptapEditor({
  pageId,
  initialContent = "",
  onUpdate,
}: TiptapEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("text");
  const [isInCodeBlock, setIsInCodeBlock] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState<Set<string>>(
    new Set(PRELOAD_LANGUAGES),
  );

  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const loadLanguagesInBackground = async () => {
      for (const lang of PRELOAD_LANGUAGES) {
        if (!loadedLanguages.has(lang)) {
          const langModule = await loadLanguage(lang);
          if (langModule) {
            lowlight.register(lang, langModule);
            setLoadedLanguages((prev) => new Set([...prev, lang]));
          }
        }
      }
    };

    const timer = setTimeout(loadLanguagesInBackground, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContentChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-outside ml-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-outside ml-6",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "leading-7",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing or press '/' for commands...",
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "list-none ml-6",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start my-1",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-gray-100 rounded-lg p-4 my-4 font-mono text-sm",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-100 px-4 py-2 font-bold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "bg-yellow-200 px-1 rounded",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Underline.configure({
        HTMLAttributes: {
          class: "underline",
        },
      }),
      Subscript,
      Superscript,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      handleContentChange();

      const isCodeBlockActive = editor.isActive("codeBlock");
      setIsInCodeBlock(isCodeBlockActive);

      if (isCodeBlockActive) {
        const node = editor.state.selection.$from.node();
        if (node?.attrs) {
          const language = node.attrs.language || "text";
          setSelectedLanguage(language);
        }
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const isCodeBlockActive = editor.isActive("codeBlock");
      setIsInCodeBlock(isCodeBlockActive);

      if (isCodeBlockActive) {
        const node = editor.state.selection.$from.node();
        if (node?.attrs) {
          const language = node.attrs.language || "text";
          setSelectedLanguage(language);
        }
      }
    },
    editable: true,
    enableInputRules: true,
    enablePasteRules: true,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] p-4",
      },
      handleKeyDown: (view, event) => {
        // Custom handling pre lists
        if (event.key === "Enter" && !event.shiftKey) {
          const { state, dispatch } = view;
          const { selection } = state;
          const { $from, empty } = selection;

          if (!empty || $from.parent.type.name !== "listItem") {
            return false;
          }

          if ($from.parentOffset === $from.parent.nodeSize - 2) {
            const tr = state.tr;
            tr.split(selection.from, 1);
            dispatch(tr);
            return true;
          }
        }

        if (event.key === "Backspace") {
          const { state, dispatch } = view;
          const { selection } = state;
          const { $from, empty } = selection;

          if (!empty || $from.parent.type.name !== "listItem") {
            return false;
          }

          if ($from.parent.textContent.length === 0) {
            if (editor) {
              editor.chain().focus().liftListItem("listItem").run();
              return true;
            }
          }
        }

        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

  const handleManualSave = useCallback(() => {
    if (editor) {
      const currentContent = editor.getHTML();
      startTransition(async () => {
        try {
          onUpdate?.(currentContent);
          await updatePageHandler(pageId, { description: currentContent });
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (err) {
          console.error("❌ Failed to save description:", err);
        }
      });
    }
  }, [editor, pageId, onUpdate]);

  const handleLanguageChange = useCallback(
    async (language: string) => {
      setSelectedLanguage(language);

      if (!loadedLanguages.has(language) && language !== "text") {
        const langModule = await loadLanguage(language);
        if (langModule) {
          lowlight.register(language, langModule);
          setLoadedLanguages((prev) => new Set([...prev, language]));
        }
      }

      if (editor?.isActive("codeBlock")) {
        editor
          .chain()
          .focus()
          .updateAttributes("codeBlock", { language })
          .run();
      } else {
        editor?.chain().focus().setCodeBlock({ language }).run();
      }
    },
    [editor, loadedLanguages],
  );

  const addCodeBlockWithLanguage = useCallback(
    (language: string) => {
      if (editor) {
        editor.chain().focus().setCodeBlock({ language }).run();
      }
    },
    [editor],
  );

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      // Check if the link has protocol, if not add https://
      const formattedUrl = linkUrl.startsWith("http")
        ? linkUrl
        : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href: formattedUrl }).run();
      setLinkUrl("");
      setLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setImageDialogOpen(false);
    }
  }, [editor, imageUrl]);

  const removeLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  // Table functions
  const addTable = useCallback(() => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    }
  }, [editor]);

  const deleteTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteTable().run();
    }
  }, [editor]);

  const addColumn = useCallback(() => {
    if (editor) {
      editor.chain().focus().addColumnAfter().run();
    }
  }, [editor]);

  const deleteColumn = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteColumn().run();
    }
  }, [editor]);

  const addRow = useCallback(() => {
    if (editor) {
      editor.chain().focus().addRowAfter().run();
    }
  }, [editor]);

  const deleteRow = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteRow().run();
    }
  }, [editor]);

  // Zjednodušená funkcia pre toolbar tlačidlá
  const handleToolbarAction = useCallback(
    (action: () => void) => {
      return () => {
        action();
        setTimeout(() => {
          editor?.commands.focus();
        }, 10);
      };
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[500px] border rounded-lg">
      {/* Toolbar */}
      <div
        className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-background/95 p-2 backdrop-blur supports-backdrop-filter:bg-background/60"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        {/* Text formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleBold().run(),
          )}
          className={editor.isActive("bold") ? "bg-accent" : ""}
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleItalic().run(),
          )}
          className={editor.isActive("italic") ? "bg-accent" : ""}
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleUnderline().run(),
          )}
          className={editor.isActive("underline") ? "bg-accent" : ""}
          type="button"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleStrike().run(),
          )}
          className={editor.isActive("strike") ? "bg-accent" : ""}
          type="button"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleCode().run(),
          )}
          className={editor.isActive("code") ? "bg-accent" : ""}
          type="button"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleHighlight().run(),
          )}
          className={editor.isActive("highlight") ? "bg-accent" : ""}
          type="button"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleSubscript().run(),
          )}
          className={editor.isActive("subscript") ? "bg-accent" : ""}
          type="button"
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleSuperscript().run(),
          )}
          className={editor.isActive("superscript") ? "bg-accent" : ""}
          type="button"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Headings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
          )}
          className={
            editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""
          }
          type="button"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
          )}
          className={
            editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
          }
          type="button"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
          )}
          className={
            editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
          }
          type="button"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleBulletList().run(),
          )}
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
          type="button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleOrderedList().run(),
          )}
          className={editor.isActive("orderedList") ? "bg-accent" : ""}
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleTaskList().run(),
          )}
          className={editor.isActive("taskList") ? "bg-accent" : ""}
          type="button"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().setTextAlign("left").run(),
          )}
          className={editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""}
          type="button"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().setTextAlign("center").run(),
          )}
          className={
            editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""
          }
          type="button"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().setTextAlign("right").run(),
          )}
          className={editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}
          type="button"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().setTextAlign("justify").run(),
          )}
          className={
            editor.isActive({ textAlign: "justify" }) ? "bg-accent" : ""
          }
          type="button"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Blocks */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().toggleBlockquote().run(),
          )}
          className={editor.isActive("blockquote") ? "bg-accent" : ""}
          type="button"
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Code Block with Language Selector */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToolbarAction(() =>
              addCodeBlockWithLanguage(selectedLanguage),
            )}
            className={editor.isActive("codeBlock") ? "bg-accent" : ""}
            type="button"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger
              className={`w-[130px] h-8 text-xs ${isInCodeBlock ? "bg-blue-50 border-blue-200" : ""}`}
            >
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isInCodeBlock && (
            <span className="text-xs text-muted-foreground ml-1">
              Editing code
            </span>
          )}
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Table Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(addTable)}
          type="button"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        {editor.isActive("table") && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToolbarAction(deleteTable)}
              type="button"
            >
              Delete Table
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToolbarAction(addColumn)}
              type="button"
            >
              Add Column
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToolbarAction(deleteColumn)}
              type="button"
            >
              Delete Column
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToolbarAction(addRow)}
              type="button"
            >
              Add Row
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToolbarAction(deleteRow)}
              type="button"
            >
              Delete Row
            </Button>
          </>
        )}

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Link, Image */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() => setLinkDialogOpen(true))}
          type="button"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        {editor.isActive("link") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToolbarAction(removeLink)}
            type="button"
          >
            Remove Link
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() => setImageDialogOpen(true))}
          type="button"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* History */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().undo().run(),
          )}
          disabled={!editor.can().undo()}
          type="button"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolbarAction(() =>
            editor.chain().focus().redo().run(),
          )}
          disabled={!editor.can().redo()}
          type="button"
        >
          <Redo className="h-4 w-4" />
        </Button>

        {/* Manual Save Button */}
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button
          variant={hasUnsavedChanges ? "default" : "ghost"}
          size="sm"
          onClick={handleManualSave}
          disabled={isPending || !hasUnsavedChanges}
          className={
            hasUnsavedChanges ? "bg-primary text-primary-foreground" : ""
          }
          type="button"
        >
          <Save className="h-4 w-4 mr-1" />
          {isPending ? "Saving..." : hasUnsavedChanges ? "Save *" : "Saved"}
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full min-h-[400px]" />
      </div>

      {/* Save indicator */}
      <div className="border-t p-2">
        {hasUnsavedChanges ? (
          <p className="text-sm text-yellow-600 px-4 font-medium">
            ⚠️ You have unsaved changes. Click Save to keep your work.
          </p>
        ) : isPending ? (
          <p className="text-sm text-blue-600 px-4">💾 Saving...</p>
        ) : lastSaved ? (
          <p className="text-sm text-green-600 px-4">
            ✓ Last saved at {lastSaved.toLocaleTimeString()}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground px-4">Ready to edit</p>
        )}
      </div>

      {/* Link dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Enter the URL you want to link to
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLink()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>Enter the image URL</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addImage()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addImage}>Add Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}