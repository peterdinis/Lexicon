"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { CoverImageSelector } from "../images/CoverImageSelector";
import { EmojiPicker } from "../shared/EmojiPicker";
import { ShareDialog } from "../dialogs/ShareDialog";

interface PageHeaderProps {
  pageId: string;
}

const fetchPage = async (pageId: string) => {
  const res = await fetch(`/api/pages/${pageId}`);
  if (!res.ok) throw new Error("Failed to fetch page");
  return res.json();
};

export function PageHeader({ pageId }: PageHeaderProps) {
  const {
    data: page,
    error,
    mutate,
  } = useSWR(
    () => pageId,
    () => fetchPage(pageId),
  );

  const [title, setTitle] = useState<string>("");
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  // Sync SWR data to local state
  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setIcon(page.icon);
      setCoverImage(page.cover_image);
    }
  }, [page]);

  // Auto-save title after debounce
  useEffect(() => {
    if (!page) return;
    const timer = setTimeout(async () => {
      if (title !== page.title) {
        await fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        mutate(); // Revalidate SWR cache
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, page, pageId, mutate]);

  const handleIconChange = async (newIcon: string) => {
    setIcon(newIcon);
    await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon: newIcon }),
    });
    mutate(); // Revalidate SWR
  };

  const handleCoverImageChange = async (newCoverImage: string | null) => {
    setCoverImage(newCoverImage || undefined);
    await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cover_image: newCoverImage }),
    });
    mutate(); // Revalidate SWR
  };

  if (error) return <div>Error loading page</div>;
  if (!page) return <div>Loading...</div>;

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
