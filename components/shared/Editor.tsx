"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { FC, useState, useCallback } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
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

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`;

export const GET_CURRENT_WORKSPACE = gql`
  query CurrentWorkspace($userId: Int!) {
    currentWorkspace(userId: $userId) {
      id
      name
      description
      createdAt
    }
  }
`;

const Editor: FC = () => {
  const editor = useCreateBlockNote();
  const [title, setTitle] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 1. Get current user
  const { data: meData, loading: meLoading } = useQuery(ME_QUERY);

  // 2. Get workspace
  const { data: wsData, loading: wsLoading } = useQuery(GET_CURRENT_WORKSPACE, {
    skip: !meData?.me?.id,
    variables: { userId: meData?.me?.id },
  });

  const [createPage, { loading: saving }] = useMutation(CREATE_PAGE, {
    onCompleted: (data) => {
      console.log("Page saved:", data.createPage);
      setLastSaved(new Date());
    },
    onError: (err) => {
      console.error("Error saving page:", err);
    },
  });

  const savePage = useCallback(async () => {
  if (!editor || !title.trim()) return;
  if (!meData?.me?.id || !wsData?.currentWorkspace?.id) {
    console.error("Missing user or workspace");
    return;
  }

  const content = editor.blocksToJSON(); // ✅ JSON-ready

  try {
    await createPage({
      variables: {
        input: {
          title,
          content: JSON.stringify(content),
          workspaceId: wsData.currentWorkspace.id,
          ownerId: meData.me.id,
        },
      },
    });
    setLastSaved(new Date());
  } catch (err) {
    console.error("Failed to save page:", err);
  }
}, [title, editor, meData, wsData, createPage]);

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
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

      <div className="rounded-2xl border shadow-sm p-6">
        {editor && (
          <BlockNoteView
            editor={editor}
            shadCNComponents={{}}
            className="min-h-[70vh] text-lg"
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {saving
            ? <Loader2 className="animate-spin w-5 h-5" />
            : lastSaved
              ? `Last saved at ${lastSaved.toLocaleTimeString()}`
              : "Not saved yet"}
        </div>
        <Button onClick={savePage}>
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default Editor;
