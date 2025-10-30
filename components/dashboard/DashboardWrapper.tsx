import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getFoldersAction } from "@/actions/folderActions";
import DashboardClient from "./DashboardClient";
import { getAllPagesHandler } from "@/actions/handlers/pagesHandlers";

// Helper function to safely extract and transform data
function transformPagesData(data: any) {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      cover_image: item.coverImage, // Map coverImage to cover_image
      parent_id: item.parent_id,
      is_folder: item.is_folder,
      in_trash: item.in_trash,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  }
  
  return [];
}

function transformFoldersData(data: any) {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      in_trash: item.in_trash,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  }
  
  return [];
}

export default async function DashboardPage() {
  let pages: any[] = [];
  let folders: any[] = [];

  try {
    const [pagesResponse, foldersResponse] = await Promise.all([
      getAllPagesHandler(),
      getFoldersAction(),
    ]);

    // Transform data to match our types
    pages = transformPagesData(pagesResponse);
    folders = transformFoldersData(foldersResponse);

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <DashboardSidebar initialPages={pages} />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardTopBar />

        <main className="flex-1 overflow-auto">
          <AnimatedPageWrapper>
            <DashboardClient pages={pages} folders={folders} />
          </AnimatedPageWrapper>
        </main>
      </div>
    </div>
  );
}