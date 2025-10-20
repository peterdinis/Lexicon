"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { CoverImageSelector } from "../images/CoverImageSelector";
import { EmojiPicker } from "../shared/EmojiPicker";
import { ShareDialog } from "../dialogs/ShareDialog";
import { debounce } from "@/lib/debounce";

interface PageHeaderProps {
  pageId: string;
  title: string;
  icon?: string;
  coverImage?: string | null;
  isSaving?: boolean;
  onTitleChange?: (value: string) => void;
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

  const debouncedTitleChange = useCallback(
    debounce((value: string) => {
      onTitleChange?.(value);
    }, 500),
    [onTitleChange],
  );

  const handleTitleChange = (value: string) => {
    setLocalTitle(value);
    debouncedTitleChange(value);
  };

  const handleCoverChange = useCallback((newCover: string) => {
    console.log("TODO: cover change", newCover);
  }, []);

  const handleIconChange = useCallback((newIcon: string) => {
    console.log("TODO: icon change", newIcon);
  }, []);

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
              onChange={() => {
                console.log("TODO");
              }}
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiPicker value={icon} onChange={handleIconChange} />
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
