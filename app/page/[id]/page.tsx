import { redirect } from "next/navigation";
import PageViewClient from "@/components/pages/PageViewClient";
import { getPageHandler, getAllPagesHandler } from "@/actions/pagesActions";

// Povoliť dynamický rendering
export const dynamic = "force-dynamic";

interface PageViewProps {
  params: {
    id: string;
  };
}

export default async function PageView({ params }: PageViewProps) {
  const { id } = params;

  if (!id) {
    console.error("Page ID is undefined");
    redirect("/dashboard");
  }

  try {
    const [page, pages] = await Promise.all([
      getPageHandler(id),
      getAllPagesHandler(),
    ]);

    if (!page) {
      redirect("/dashboard");
    }

    return <PageViewClient id={id} page={page} pages={pages} />;
  } catch (error: any) {
    console.error("Error loading page:", error.message);
    redirect("/dashboard");
  }
}
