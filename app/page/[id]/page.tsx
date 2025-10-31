import { redirect } from "next/navigation";
import PageViewClient from "@/components/pages/PageViewClient";
import { getPageHandler, getAllPagesHandler } from "@/actions/pagesActions";

export default async function PageView({ params }: { params: { id: string } }) {
  const { id } = params;

  const page = await getPageHandler(id);
  if (!page) redirect("/");

  const pages = await getAllPagesHandler();

  return <PageViewClient id={id} page={page} pages={pages} />;
}
