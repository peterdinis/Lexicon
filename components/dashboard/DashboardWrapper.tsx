import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getFoldersAction } from "@/actions/folderActions";
import DashboardClient from "./DashboardClient";
import { getAllPagesHandler } from "@/actions/handlers/pagesHandlers";

// Použite existujúce typy z vašej aplikácie alebo definujte základné
type PageType = any; // Nahraďte správnym typom
type FolderType = any; // Nahraďte správnym typom

export default async function DashboardPage() {
  let pages: PageType[] = [];
  let folders: FolderType[] = [];

  try {
    const pagesPromise = getAllPagesHandler() as Promise<PageType[] | { data: PageType[] } | { success: boolean; data: PageType[] }>;
    const foldersPromise = getFoldersAction() as Promise<FolderType[] | { data: FolderType[] } | { success: boolean; data: FolderType[] }>;

    const [pagesResponse, foldersResponse] = await Promise.all([
      pagesPromise,
      foldersPromise
    ]);

    // Extrahovanie pages dát
    if (Array.isArray(pagesResponse)) {
      pages = pagesResponse;
    } else if (pagesResponse && typeof pagesResponse === 'object' && 'data' in pagesResponse) {
      pages = Array.isArray(pagesResponse.data) ? pagesResponse.data : [];
    } else if (pagesResponse && typeof pagesResponse === 'object' && 'success' in pagesResponse) {
      pages = Array.isArray((pagesResponse as any).data) ? (pagesResponse as any).data : [];
    }

    // Extrahovanie folders dát
    if (Array.isArray(foldersResponse)) {
      folders = foldersResponse;
    } else if (foldersResponse && typeof foldersResponse === 'object' && 'data' in foldersResponse) {
      folders = Array.isArray(foldersResponse.data) ? foldersResponse.data : [];
    } else if (foldersResponse && typeof foldersResponse === 'object' && 'success' in foldersResponse) {
      folders = Array.isArray((foldersResponse as any).data) ? (foldersResponse as any).data : [];
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

        <main className="flex-1 overflow-auto">
          <AnimatedPageWrapper>
            <DashboardClient pages={pages} folders={folders} />
          </AnimatedPageWrapper>
        </main>
      </div>
    </div>
  );
}