"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { PageHeader } from "@/components/pages/PageHeader";
import { TiptapEditor } from "@/components/editor/TipTapEditor";
import { debounce } from "@/lib/debounce";
import { updatePageHandler } from "@/actions/pagesActions";
import { Page } from "@/types/pageTypes";

interface PageViewClientProps {
  id: string;
  page: Page;
  pages: Page[];
}

export default function PageViewClient({
  id,
  page,
  pages,
}: PageViewClientProps) {
  const [isPending, startTransition] = useTransition();
  const [localPage, setLocalPage] = useState<Page>(page);
  const [sidebarPages, setSidebarPages] = useState(pages);

  // Memoized debounced save functions
  const saveTitle = useMemo(
    () =>
      debounce(async (newTitle: string) => {
        startTransition(async () => {
          try {
            await updatePageHandler(id, { title: newTitle });
            setSidebarPages((prev) =>
              prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)),
            );
            setLocalPage((prev) => ({ ...prev, title: newTitle }));
          } catch (err) {
            console.error("❌ Failed to update title:", err);
          }
        });
      }, 1000),
    [id],
  );

  const saveDescription = useMemo(
    () =>
      debounce(async (description: string) => {
        startTransition(async () => {
          try {
            await updatePageHandler(id, { description });
            setLocalPage((prev) => ({ ...prev, description }));
          } catch (err) {
            console.error("❌ Failed to update description:", err);
          }
        });
      }, 1000),
    [id],
  );

  // Event handlers
  const handleTitleChange = useCallback(
    (value: string) => {
      setLocalPage((prev) => ({ ...prev, title: value }));
      saveTitle(value);
    },
    [saveTitle],
  );

  const handleDescriptionChange = useCallback(
    (description: string) => {
      setLocalPage((prev) => ({ ...prev, description }));
      saveDescription(description);
    },
    [saveDescription],
  );

  const handleIconChange = useCallback(
    async (icon: string) => {
      try {
        await updatePageHandler(id, { icon });
        setLocalPage((prev) => ({ ...prev, icon }));
        setSidebarPages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, icon } : p)),
        );
      } catch (err) {
        console.error("❌ Failed to update icon:", err);
      }
    },
    [id],
  );

  const handleCoverChange = useCallback(
    async (coverImage: string | null) => {
      try {
        await updatePageHandler(id, { coverImage });
        setLocalPage((prev) => ({ ...prev, cover_image: coverImage }));
      } catch (err) {
        console.error("❌ Failed to update cover image:", err);
      }
    },
    [id],
  );

  return (
    <div className="flex h-screen flex-col">
      <DashboardTopBar />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar initialPages={sidebarPages} currentPageId={id} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <PageHeader
            pageId={id}
            title={localPage.title}
            icon={localPage.icon || undefined}
            coverImage={localPage.cover_image || undefined}
            onTitleChange={handleTitleChange}
            onIconChange={handleIconChange}
            onCoverChange={handleCoverChange}
            isSaving={isPending}
          />
          <main className="flex-1 overflow-y-auto p-4">
            <TiptapEditor
              pageId={id}
              initialContent={localPage.description || ""}
              onUpdate={handleDescriptionChange}
            />
          </main>
        </div>
      </div>
    </div>
  );
}