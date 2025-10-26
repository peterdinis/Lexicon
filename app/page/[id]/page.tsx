"use server";

import { redirect } from "next/navigation";
import { getAllPagesAction, getPageAction } from "@/actions/pagesActions";
import PageViewClient from "@/components/pages/PageViewClient";

export default async function PageView(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const pageResult = await getPageAction({ id });
  const page = pageResult?.data;

  if (!page) redirect("/");

  const pagesResult = await getAllPagesAction();
  const pages = pagesResult?.data || [];

  return <PageViewClient id={id} page={page} pages={pages} />;
}
