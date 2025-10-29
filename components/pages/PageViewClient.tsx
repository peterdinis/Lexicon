"use client";

import { useState, useTransition, useCallback } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { PageHeader } from "@/components/pages/PageHeader";
import { TiptapEditor } from "@/components/editor/TipTapEditor";
import { updatePageAction } from "@/actions/pagesActions";
import { debounce } from "@/lib/debounce";
import { Page } from "@/types/applicationTypes";

export default function PageViewClient({
  id,
  page,
  pages,
}: {
  id: string;
  page: Page;
  pages: any[];
}) {
  const [title, setTitle] = useState(page.title || "");
  const [isPending, startTransition] = useTransition();
  const [sidebarPages, setSidebarPages] = useState(pages);
  const [currentPage, setCurrentPage] = useState(page);

  const saveTitle = useCallback(
    debounce((newTitle: string) => {
      startTransition(async () => {
        try {
          await updatePageAction({ id, title: newTitle });
          setSidebarPages((prev) =>
            prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)),
          );
          setCurrentPage((prev: any) => ({ ...prev, title: newTitle }));
        } catch (err) {
          console.error("❌ Failed to update title:", err);
        }
      });
    }, 1000),
    [id],
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    saveTitle(value);
  };

  const saveDescription = useCallback(
    debounce((description: string) => {
      startTransition(async () => {
        try {
          await updatePageAction({ id, description });
          setCurrentPage((prev: any) => ({ ...prev, description }));
        } catch (err) {
          console.error("❌ Failed to update description:", err);
        }
      });
    }, 1000),
    [id],
  );

  const handleDescriptionChange = (description: string) => {
    saveDescription(description);
  };

  const handleIconChange = useCallback(
    async (icon: string) => {
      try {
        await updatePageAction({ id, icon });
        setCurrentPage((prev: any) => ({ ...prev, icon }));
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
        await updatePageAction({ id, coverImage });
        setCurrentPage((prev: any) => ({ ...prev, cover_image: coverImage }));
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
            title={title}
            icon={currentPage.icon}
            coverImage={currentPage.cover_image}
            onTitleChange={handleTitleChange}
            onIconChange={handleIconChange}
            onCoverChange={handleCoverChange}
            isSaving={isPending}
          />
          <main className="flex-1 overflow-y-auto p-4">
            <TiptapEditor
              pageId={id}
              initialContent={currentPage.description || ""}
              onUpdate={handleDescriptionChange}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
