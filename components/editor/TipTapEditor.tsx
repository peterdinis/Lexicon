"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { Image } from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import { Highlight } from "@tiptap/extension-highlight"
import { TextAlign } from "@tiptap/extension-text-align"
import { Underline } from "@tiptap/extension-underline"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { common, createLowlight } from "lowlight"
import { useEffect, useCallback } from "react"
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
  ImageIcon,
  Link2,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  UnderlineIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TableIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

const lowlight = createLowlight(common)

interface TiptapEditorProps {
  pageId: string
  initialContent?: string
  onUpdate?: (content: string) => void
}

export function TiptapEditor({ pageId, initialContent = "", onUpdate }: TiptapEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing or press '/' for commands...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 hover:text-primary/80",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Subscript,
      Superscript,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
  })

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl("")
      setLinkDialogOpen(false)
    }
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl("")
      setImageDialogOpen(false)
    }
  }, [editor, imageUrl])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
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
          className={editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""}
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
          className={editor.isActive({ textAlign: "justify" }) ? "bg-accent" : ""}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-accent" : ""}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setLinkDialogOpen(true)}>
          <Link2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setImageDialogOpen(true)}>
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* History */}
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>Enter the URL you want to link to</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addLink()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addImage()
              }
            }}
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
  )
}