import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getAllPagesHandler } from "@/actions/handlers/pageHandlers";
import { File } from "lucide-react";

export default async function DashboardPage() {
  let pages = [];

  try {
    pages = await getAllPagesHandler();
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
                  Select an existing page or create a new one to start writing.
                </p>
              </div>

              {pages.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                    Recent pages
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.slice(0, 6).map((page) => (
                      <div
                        key={page.id}
                        className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                      >
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                          {page.title || "Untitled"}
                        </h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatedPageWrapper>
        </main>
      </div>
    </div>
  );
}
