"use client";

import { useState, useTransition } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { PageHeader } from "@/components/pages/PageHeader";
import { TiptapEditor } from "@/components/editor/TipTapEditor";
import { updatePageAction } from "@/actions/pagesActions";

export default function PageViewClient({
  id,
  page,
  pages,
}: {
  id: string;
  page: any;
  pages: any[];
}) {
  const [title, setTitle] = useState(page.title || "");
  const [isPending, startTransition] = useTransition();

  const handleTitleChange = (value: string) => {
    setTitle(value);
    startTransition(() => {
      void (async () => {
        try {
          await updatePageAction({ id, title: value });
        } catch (err) {
          console.error("❌ Failed to update title:", err);
        }
      })();
    });
  };

  const handleDescriptionChange = (description: string) => {
    startTransition(() => {
      void (async () => {
        try {
          await updatePageAction({ id, description });
        } catch (err) {
          console.error("❌ Failed to update description:", err);
        }
      })();
    });
  };

  return (
    <div className="flex h-screen flex-col">
      <DashboardTopBar />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar initialPages={pages} currentPageId={id} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <PageHeader
            pageId={id}
            title={title}
            icon={page.icon}
            coverImage={page.cover_image}
            onTitleChange={handleTitleChange}
            isSaving={isPending}
          />
          <main className="flex-1 overflow-y-auto p-4">
            <TiptapEditor
              pageId={id}
              initialContent={page.description || ""}
              onUpdate={handleDescriptionChange}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
