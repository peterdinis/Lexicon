import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getFoldersAction } from "@/actions/folderActions";
import DashboardClient from "./DashboardClient";
import { getAllPagesHandler } from "@/actions/handlers/pagesHandlers";
import { z } from "zod";

// Zod schémy pre validáciu dát
const rawPageSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  is_folder: z.boolean().optional(),
  in_trash: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const rawFolderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string().optional().default(""),
  in_trash: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Typy pre DashboardClient (musia zodpovedať očakávaným typom)
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
      title: item.title || "Untitled", // Zajistíme, že title je vždy string
      description: item.description,
      parent_id: item.parent_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (error) {
    console.error("Error transforming pages data:", error);
    return [];
  }
}

function transformFoldersData(data: unknown): FolderType[] {
  try {
    const parsedData = z.array(rawFolderSchema).parse(data);

    return parsedData.map((item) => ({
      id: item.id,
      title: item.title || "Unnamed Folder",
      created_at: item.created_at,
      updated_at: item.updated_at,
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
    const [pagesResponse, foldersResponse] = await Promise.all([
      getAllPagesHandler(),
      getFoldersAction(),
    ]);

    // Transform data to match our types
    pages = transformPagesData(pagesResponse);
    folders = transformFoldersData(foldersResponse);

    console.log("F", folders);
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
