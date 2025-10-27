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
import { updatePageAction } from "@/actions/pagesActions";

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
const PRELOAD_LANGUAGES = ['javascript', 'typescript', 'python', 'php', 'css', 'json'];

// Language options
const LANGUAGE_OPTIONS = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'php', label: 'PHP' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
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
  const [loadedLanguages, setLoadedLanguages] = useState<Set<string>>(new Set(PRELOAD_LANGUAGES));

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
            setLoadedLanguages(prev => new Set([...prev, lang]));
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
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: "Start writing or press '/' for commands...",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ 
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Subscript,
      Superscript,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Len označíme že sú neuložené zmeny
      handleContentChange();
      
      const isCodeBlockActive = editor.isActive('codeBlock');
      setIsInCodeBlock(isCodeBlockActive);
      
      if (isCodeBlockActive) {
        const { node } = editor.state.selection.$from;
        if (node?.attrs) {
          const language = node.attrs.language || 'text';
          setSelectedLanguage(language);
        }
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const isCodeBlockActive = editor.isActive('codeBlock');
      setIsInCodeBlock(isCodeBlockActive);
      
      if (isCodeBlockActive) {
        const { node } = editor.state.selection.$from;
        if (node?.attrs) {
          const language = node.attrs.language || 'text';
          setSelectedLanguage(language);
        }
      }
    },
    editable: true,
    enableInputRules: true,
    enablePasteRules: true,
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
          // Volanie onUpdate callback až pri manuálnom save
          onUpdate?.(currentContent);
          
          await updatePageAction({ id: pageId, description: currentContent });
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (err) {
          console.error("❌ Failed to save description:", err);
        }
      });
    }
  }, [editor, pageId, onUpdate]);

  const handleLanguageChange = useCallback(async (language: string) => {
    setSelectedLanguage(language);
    
    if (!loadedLanguages.has(language) && language !== 'text') {
      const langModule = await loadLanguage(language);
      if (langModule) {
        lowlight.register(language, langModule);
        setLoadedLanguages(prev => new Set([...prev, language]));
      }
    }
    
    if (editor?.isActive('codeBlock')) {
      editor.chain().focus().updateAttributes('codeBlock', { language }).run();
    } else {
      editor?.chain().focus().setCodeBlock({ language }).run();
    }
  }, [editor, loadedLanguages]);

  const addCodeBlockWithLanguage = useCallback((language: string) => {
    if (editor) {
      editor.chain().focus().setCodeBlock({ language }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
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
    <div className="flex flex-col min-h-[500px]">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-background/95 p-2 backdrop-blur supports-backdrop-filter:bg-background/60">
        {/* Text formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-accent" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-accent" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-accent" : ""}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-accent" : ""}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "bg-accent" : ""}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive("highlight") ? "bg-accent" : ""}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={editor.isActive("subscript") ? "bg-accent" : ""}
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive("superscript") ? "bg-accent" : ""}
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Headings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""
          }
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
          }
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
          }
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-accent" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={editor.isActive("taskList") ? "bg-accent" : ""}
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""
          }
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" }) ? "bg-accent" : ""
          }
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* Blocks */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-accent" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        {/* Code Block with Language Selector */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addCodeBlockWithLanguage(selectedLanguage)}
            className={editor.isActive("codeBlock") ? "bg-accent" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className={`w-[130px] h-8 text-xs ${isInCodeBlock ? 'bg-blue-50 border-blue-200' : ''}`}>
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
        {/* Table, Link, Image */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLinkDialogOpen(true)}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        {editor.isActive("link") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeLink}
          >
            Remove Link
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setImageDialogOpen(true)}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* History */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
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
          className={hasUnsavedChanges ? "bg-primary text-primary-foreground" : ""}
        >
          <Save className="h-4 w-4 mr-1" />
          {isPending ? "Saving..." : hasUnsavedChanges ? "Save *" : "Saved"}
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 p-8">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none focus:outline-none"
        />
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
          <p className="text-sm text-muted-foreground px-4">
            Ready to edit
          </p>
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