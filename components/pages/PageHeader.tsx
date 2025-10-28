"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { debounce } from "@/lib/debounce";
import { updatePageAction } from "@/actions/pagesActions";
import Image from "next/image";
import { CoverImageSelector } from "../images/CoverImageSelector";
import { EmojiPicker } from "../shared/EmojiPicker";

interface PageHeaderProps {
  pageId: string;
  title: string;
  icon?: string;
  coverImage?: string | null;
  isSaving?: boolean;
  onTitleChange?: (value: string) => void;
  onIconChange?: (value: string) => void;
  onCoverChange?: (value: string | null) => void;
}

export function PageHeader({
  pageId,
  title,
  icon,
  coverImage,
  isSaving,
  onTitleChange,
  onIconChange,
  onCoverChange,
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

  const handleCoverChange = useCallback(
    async (newCover: string) => {
      try {
        await updatePageAction({
          id: pageId,
          coverImage: newCover,
        });
        onCoverChange?.(newCover);
      } catch (error) {
        console.error("Failed to update cover image:", error);
      }
    },
    [pageId, onCoverChange],
  );

  const handleIconChange = useCallback(
    async (newIcon: string) => {
      try {
        await updatePageAction({
          id: pageId,
          icon: newIcon,
        });
        onIconChange?.(newIcon);
      } catch (error) {
        console.error("Failed to update icon:", error);
      }
    },
    [pageId, onIconChange],
  );

  const handleRemoveCover = useCallback(async () => {
    try {
      await updatePageAction({
        id: pageId,
        coverImage: null,
      });
      onCoverChange?.(null);
    } catch (error) {
      console.error("Failed to remove cover image:", error);
    }
  }, [pageId, onCoverChange]);

  return (
    <div className="border-b">
      {coverImage && (
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={coverImage}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <CoverImageSelector
              value={coverImage}
              onChange={handleCoverChange}
            />
            <button
              onClick={handleRemoveCover}
              className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {!coverImage && (
        <div className="p-4">
          <CoverImageSelector value={null} onChange={handleCoverChange} />
        </div>
      )}

      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiPicker value={icon || ""} onChange={handleIconChange} />
          </div>
        </div>

        <Input
          value={localTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          className="border-0 text-3xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {isSaving && (
          <p className="mt-1 text-sm text-muted-foreground">Saving...</p>
        )}
      </div>
    </div>
  );
}
