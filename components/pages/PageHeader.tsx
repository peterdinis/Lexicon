"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { CoverImageSelector } from "../images/CoverImageSelector";
import { EmojiPicker } from "../shared/EmojiPicker";
import { ShareDialog } from "../dialogs/ShareDialog";
import { Spinner } from "../ui/spinner";

interface PageHeaderProps {
  pageId: string;
  title: string;
  icon?: string;
  coverImage?: string | null;
  isSaving?: boolean;
  onTitleChange?: (value: string) => void; // optional, pre zmenu title
}

export function PageHeader({
  pageId,
  title,
  icon,
  coverImage,
  isSaving,
  onTitleChange,
}: PageHeaderProps) {
  const [localTitle, setLocalTitle] = useState(title);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleTitleChange = (value: string) => {
    setLocalTitle(value);
    onTitleChange?.(value);
  };

  return (
    <div className="border-b">
      {coverImage && (
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={coverImage || "/placeholder.svg"}
            alt="Cover"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-4 right-4">
            <CoverImageSelector
              value={coverImage}
              onChange={() => console.log("TODO: cover change")}
            />
          </div>
        </div>
      )}
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiPicker
              value={icon}
              onChange={() => console.log("TODO: icon change")}
            />
          </div>
          <ShareDialog pageId={pageId} />
        </div>

        <Input
          value={localTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="border-0 text-3xl font-bold focus-visible:ring-0"
        />

        {isSaving && (
          <p className="mt-1 text-sm text-muted-foreground">Saving...</p>
        )}
      </div>
    </div>
  );
}
