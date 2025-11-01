import { redirect } from "next/navigation";
import PageViewClient from "@/components/pages/PageViewClient";
import { getPageHandler, getAllPagesHandler } from "@/actions/pagesActions";

interface PageViewProps {
  params: { 
    id: string 
  };
}

export default async function PageView({ params }: PageViewProps) {
  const { id } = params;

  try {
    const [page, pages] = await Promise.all([
      getPageHandler(id),
      getAllPagesHandler()
    ]);

    if (!page) {
      console.error("Page not found, redirecting to dashboard");
      redirect("/dashboard");
    }

    return <PageViewClient id={id} page={page} pages={pages} />;
    
  } catch (error) {
    console.error("Error loading page:", error);
    redirect("/dashboard");
  }
}