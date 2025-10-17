"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { CoverImageSelector } from "../images/CoverImageSelector";
import { EmojiPicker } from "../shared/EmojiPicker";
import { ShareDialog } from "../dialogs/ShareDialog";

interface PageHeaderProps {
  pageId: string;
  title: string;
  icon?: string;
  coverImage?: string;
}

export function PageHeader({
  pageId,
  title: initialTitle,
  icon: initialIcon,
  coverImage: initialCoverImage,
}: PageHeaderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [coverImage, setCoverImage] = useState(initialCoverImage);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== initialTitle) {
        fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, pageId, initialTitle]);

  const handleIconChange = async (newIcon: string) => {
    setIcon(newIcon);
    await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon: newIcon }),
    });
  };

  const handleCoverImageChange = async (newCoverImage: string | null) => {
    setCoverImage(newCoverImage || undefined);
    await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cover_image: newCoverImage }),
    });
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
              onChange={handleCoverImageChange}
            />
          </div>
        </div>
      )}
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiPicker value={icon} onChange={handleIconChange} />
            {!coverImage && (
              <CoverImageSelector
                value={coverImage}
                onChange={handleCoverImageChange}
              />
            )}
          </div>
          <ShareDialog pageId={pageId} />
        </div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="border-0 text-3xl font-bold focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
