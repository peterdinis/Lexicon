import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getFoldersAction } from "@/actions/folderActions";
import DashboardClient from "./DashboardClient";
import { getAllPagesHandler } from "@/actions/handlers/pagesHandlers";
import { z } from "zod";

// Updated Zod schemas to handle actual data types
const rawPageSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  icon: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
  is_folder: z.boolean().optional(),
  in_trash: z.boolean().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

const rawFolderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string().optional().default(""),
  in_trash: z.boolean().optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Response schema for folders action (might return object with data property)
const foldersResponseSchema = z.union([
  z.array(rawFolderSchema), // Direct array
  z.object({
    // Or object with data property
    data: z.array(rawFolderSchema).optional(),
    success: z.boolean().optional(),
    error: z.string().optional(),
  }),
]);

// Types for DashboardClient
interface Page {
  id: string;
  title: string;
  description?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface FolderType {
  id: string;
  title: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Helper function to safely extract and transform data
function transformPagesData(data: unknown): Page[] {
  try {
    const parsedData = z.array(rawPageSchema).parse(data);

    return parsedData.map((item) => ({
      id: item.id,
      title: item.title || "Untitled",
      description: item.description,
      parent_id: item.parent_id,
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

    // Now transform the array
    return foldersArray.map((item) => ({
      id: item.id,
      title: item.title || "Unnamed Folder",
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

    console.log("Pages:", pages.length);
    console.log("Folders:", folders.length);

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
