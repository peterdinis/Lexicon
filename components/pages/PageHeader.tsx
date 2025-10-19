"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { CoverImageSelector } from "../images/CoverImageSelector";
import { EmojiPicker } from "../shared/EmojiPicker";
import { ShareDialog } from "../dialogs/ShareDialog";
import { getPageAction } from "@/actions/pagesActions";
import { Spinner } from "../ui/spinner";

interface PageHeaderProps {
  pageId: string;
  title?: string;
  icon?: string;
  coverImage?: string | null;
}

export function PageHeader({
  pageId,
  title: initialTitle,
  icon: initialIcon,
  coverImage: initialCoverImage,
}: PageHeaderProps) {
  const [title, setTitle] = useState<string>(initialTitle || "");
  const [icon, setIcon] = useState<string | undefined>(initialIcon);
  const [coverImage, setCoverImage] = useState<string | undefined>(
    initialCoverImage || undefined,
  );
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(!initialTitle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const result = await getPageAction({ id: pageId });

        if (result?.serverError) {
          setError(result.serverError);
          return;
        }

        if (result?.data) {
          setPage(result.data);
          setTitle(result.data.title);
          setIcon(result.data.icon);
          setCoverImage(result.data.cover_image || undefined);
        }
      } catch (err) {
        setError("Failed to load page");
        console.error("Error loading page:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!initialTitle) {
      loadPage();
    } else {
      setPage({
        title: initialTitle,
        icon: initialIcon,
        cover_image: initialCoverImage,
      });
    }
  }, [pageId, initialTitle, initialIcon, initialCoverImage]);

  if (error) return <div>Error loading page: {error}</div>;
  if (loading) return <Spinner />

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
                console.log("DO NOTHING");
              }}
            />
          </div>
        </div>
      )}
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EmojiPicker
              value={icon}
              onChange={() => {
                console.log("DO NOTHING");
              }}
            />
            {!coverImage && (
              <CoverImageSelector
                value={coverImage}
                onChange={() => {
                  console.log("DO NOTHING");
                }}
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
