import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getFoldersAction } from "@/actions/folderActions";
import DashboardClient from "./DashboardClient";
import { getAllPagesHandler } from "@/actions/handlers/pagesHandlers";
import { z } from "zod";
import { rawPageSchema } from "@/actions/schemas/pagesSchemas";
import {
  foldersResponseSchema,
  rawFolderSchema,
} from "@/actions/schemas/folderSchemas";

interface Page {
  id: string;
  title: string;
  description?: string;
  parent_id?: string | null;
  in_trash?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FolderType {
  id: string;
  title: string;
  parent_id?: string | null;
  in_trash?: boolean;
  created_at?: string;
  updated_at?: string;
}

function transformPagesData(data: unknown): Page[] {
  try {
    const parsedData = z.array(rawPageSchema).parse(data);
    return parsedData
      .filter((item) => !item.in_trash)
      .map((item) => ({
        id: item.id,
        title: item.title || "Untitled",
        description: item.description,
        parent_id: item.parent_id,
        in_trash: item.in_trash,
        created_at: item.created_at
          ? typeof item.created_at === "string"
            ? item.created_at
            : item.created_at.toISOString()
          : undefined,
        updated_at: item.updated_at
          ? typeof item.updated_at === "string"
            ? item.updated_at
            : item.updated_at.toISOString()
          : undefined,
      }));
  } catch (error) {
    console.error("Error transforming pages data:", error);
    return [];
  }
}

function transformFoldersData(data: unknown): FolderType[] {
  try {
    // First parse with the union schema to handle different response formats
    const parsedResponse = foldersResponseSchema.parse(data);

    let foldersArray: z.infer<typeof rawFolderSchema>[] = [];

    if (Array.isArray(parsedResponse)) {
      foldersArray = parsedResponse;
    } else if (parsedResponse.data && Array.isArray(parsedResponse.data)) {
      foldersArray = parsedResponse.data;
    } else if (parsedResponse.error) {
      console.error("Folder action returned error:", parsedResponse.error);
      return [];
    }

    // Filter out trashed folders and transform
    return foldersArray
      .filter((item) => !item.in_trash) // Filter out trashed items
      .map((item) => ({
        id: item.id,
        title: item.title || "Unnamed Folder",
        in_trash: item.in_trash,
        created_at: item.created_at
          ? typeof item.created_at === "string"
            ? item.created_at
            : item.created_at.toISOString()
          : undefined,
        updated_at: item.updated_at
          ? typeof item.updated_at === "string"
            ? item.updated_at
            : item.updated_at.toISOString()
          : undefined,
      }));
  } catch (error) {
    console.error("Error transforming folders data:", error);
    return [];
  }
}

export default async function DashboardPage() {
  let pages: Page[] = [];
  let folders: FolderType[] = [];

  try {
    const [pagesResponse, foldersResponse] = await Promise.allSettled([
      getAllPagesHandler(),
      getFoldersAction(),
    ]);

    // Handle pages response
    if (pagesResponse.status === "fulfilled") {
      pages = transformPagesData(pagesResponse.value);
    } else {
      console.error("Failed to fetch pages:", pagesResponse.reason);
    }

    // Handle folders response
    if (foldersResponse.status === "fulfilled") {
      folders = transformFoldersData(foldersResponse.value);
    } else {
      console.error("Failed to fetch folders:", foldersResponse.reason);
    }

    // If both requests failed, redirect to login
    if (
      pagesResponse.status === "rejected" &&
      foldersResponse.status === "rejected"
    ) {
      redirect("/auth/login");
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <DashboardSidebar initialPages={pages} />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardTopBar />

        <main className="flex-1 overflow-auto bg-background">
          <AnimatedPageWrapper>
            <DashboardClient pages={pages} folders={folders} />
          </AnimatedPageWrapper>
        </main>
      </div>
    </div>
  );
}
