import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getAllPagesHandler } from "@/actions/handlers/pageHandlers";
import { File, Folder } from "lucide-react";
import Link from "next/link";
import { getFoldersAction } from "@/actions/folderActions";
import { Key } from "react";

export default async function DashboardPage() {
  let pages = [];
  let folders = [];

  try {
    const pagesResult = await getAllPagesHandler();
    const foldersResult = await getFoldersAction();
    
    // Extrahujeme data z výsledkov
    pages = pagesResult|| [];
    folders = foldersResult.data || []
    
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-900">
      <DashboardSidebar initialPages={pages} />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardTopBar />

        <main className="flex-1 overflow-auto">
          <AnimatedPageWrapper>
            <div className="max-w-4xl mx-auto px-8 py-12">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                  <File className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-3">
                  Welcome to Lexicon
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                  Select an existing page or folder to start writing.
                </p>
              </div>

              {/* Folders Section - ROVNAKO AKO PAGES */}
              {folders.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                    Your Folders
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folders.slice(0, 6).map((folder) => (
                      <Link
                        key={folder.id}
                        href={`/folder/${folder.id}`}
                        className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors block"
                      >
                        <div className="flex items-center mb-2">
                          <Folder className="w-5 h-5 mr-2 text-neutral-500" />
                          <h3 className="font-medium text-neutral-900 dark:text-white">
                            {folder.title || "Unnamed Folder"}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Pages Section - PÔVODNÝ KÓD */}
              {pages.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                    Recent Pages
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.slice(0, 6).map((page: { id: Key | null | undefined; title: any; description: any; }) => (
                      <Link
                        key={page.id}
                        href={`/page/${page.id}`}
                        className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors block"
                      >
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                          {page.title || "Untitled"}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                          {page.description || "No description available"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Ak nie sú žiadne pages ani folders */}
              {pages.length === 0 && folders.length === 0 && (
                <div className="mt-16 text-center">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No pages or folders yet. Create your first one to get started!
                  </p>
                </div>
              )}
            </div>
          </AnimatedPageWrapper>
        </main>
      </div>
    </div>
  );
}