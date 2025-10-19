import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { PageHeader } from "@/components/pages/PageHeader";
import { TiptapEditor } from "@/components/editor/TipTapEditor";
import { redirect } from "next/navigation";
import { getAllPagesAction, getPageAction } from "@/actions/pagesActions";

export default async function PageView({ params }: { params: { id: string } }) {
  "use server";

  const { id } = params;
  
  const pageResult = await getPageAction({ id });
  const page = pageResult.data;

  if (!page) redirect("/");

  const pagesResult = await getAllPagesAction();
  const pages = pagesResult.data;

  return (
    <div className="flex h-screen flex-col">
      <DashboardTopBar />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar initialPages={pages || []} currentPageId={id} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <PageHeader
            pageId={id}
            title={page.title}
            icon={page.icon}
            coverImage={page.cover_image}
          />
          <main className="flex-1 overflow-y-auto p-4">
            <TiptapEditor pageId={id} initialContent={page.content || ""} />
          </main>
        </div>
      </div>
    </div>
  );
}
