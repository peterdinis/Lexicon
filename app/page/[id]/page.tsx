"use server";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { PageHeader } from "@/components/pages/PageHeader";
import { TiptapEditor } from "@/components/editor/TipTapEditor";
import { redirect } from "next/navigation";
import { getAllPagesAction, getPageAction, updatePageAction } from "@/actions/pagesActions";
import { useState, useTransition, useCallback } from "react";

// 🔁 debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export default async function PageView(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const pageResult = await getPageAction({ id });
  const page = pageResult.data;

  if (!page) redirect("/");

  const pagesResult = await getAllPagesAction();
  const pages = pagesResult.data;

  // client component for live updates
  return (
    <PageViewClient
      id={id}
      page={page}
      pages={pages || []}
    />
  );
}

// ✅ Client component (so we can handle typing and saving)
"use client";
function PageViewClient({
  id,
  page,
  pages,
}: {
  id: string;
  page: any;
  pages: any[];
}) {
  const [title, setTitle] = useState(page.title || "");
  const [description, setDescription] = useState(page.description || "");
  const [isPending, startTransition] = useTransition();

  const savePage = useCallback(
    debounce(async (newTitle: string, newDescription: string) => {
      try {
        await updatePageAction({
          id,
          title: newTitle,
          description: newDescription,
        });
      } catch (err) {
        console.error("❌ Failed to update page:", err);
      }
    }, 1000),
    [id],
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    startTransition(() => savePage(value, description));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    startTransition(() => savePage(title, value));
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
              initialContent={page.description || ""} // description ide do editora
              onUpdate={(content) => updatePageAction({ id, description: content })}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
