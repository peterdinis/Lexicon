"use client"

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { FC, useState, useEffect, useCallback } from "react";
import { gql, useMutation } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const CREATE_PAGE = gql`
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      id
      title
    }
  }
`;

const AUTOSAVE_DELAY = 1500; // 1.5s debounce

const Editor: FC = () => {
  const editor = useCreateBlockNote();
  const [title, setTitle] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [createPage, { loading }] = useMutation(CREATE_PAGE, {
    onCompleted: (data) => {
      console.log("Page saved:", data.createPage);
      setLastSaved(new Date());
    },
    onError: (err) => {
      console.error("Error saving page:", err);
    }
  });

  // Autosave function
  const savePage = useCallback(async () => {
    if (!editor || !title.trim()) return; // ✅ fix for undefined editor
    const content = editor.document;
    await createPage({
      variables: {
        input: {
          title,
          content: JSON.stringify(content),
        },
      },
    });
  }, [title, editor, createPage]);

  // Debounced autosave when editor changes
  useEffect(() => {
    if (!editor) return; // ✅ check if editor exists

    const unsubscribe = editor.onChange(() => {
      const handler = setTimeout(savePage, AUTOSAVE_DELAY);
      return () => clearTimeout(handler);
    });

    return () => {
      unsubscribe?.();
    };
  }, [editor, savePage]);

  // Debounced autosave when title changes
  useEffect(() => {
    if (!title) return;
    const handler = setTimeout(savePage, AUTOSAVE_DELAY);
    return () => clearTimeout(handler);
  }, [title, savePage]);

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Notion-like title */}
      <Input
        placeholder="Untitled"
        className={cn(
          "text-4xl font-bold border-0 shadow-none",
          "focus-visible:ring-0 focus-visible:outline-none mb-8",
          "placeholder:text-muted-foreground"
        )}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Editor */}
      <div className="rounded-2xl border shadow-sm p-6">
        <BlockNoteView
          editor={editor}
          shadCNComponents={{}}
          className="min-h-[70vh] text-lg"
        />
      </div>

      {/* Status bar + Save button */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {loading
            ? <Loader2 className="animate-spin w-8 h-8" />
            : lastSaved
            ? `Last saved at ${lastSaved.toLocaleTimeString()}`
            : "Not saved yet"}
        </div>
        <Button onClick={savePage} disabled={loading || !title.trim()}>
          {loading ? <Loader2 className="animate-spin w-8 h-8" /> : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default Editor;
