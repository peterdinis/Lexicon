import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getAllPagesHandler } from "@/actions/handlers/pageHandlers";

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
      {/* Sidebar */}
      <DashboardSidebar initialPages={pages} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardTopBar />

        <main className="flex-1 overflow-auto">
          <AnimatedPageWrapper>
            <div className="max-w-4xl mx-auto px-8 py-12">
              {/* Empty State - Notion-like */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-3">
                  Welcome to Lexicon
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                  Select an existing page or create a new one to start writing.
                </p>

                {/* Quick Actions - Notion-like */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                    + New page
                  </button>
                  <button className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    Import
                  </button>
                </div>
              </div>

              {/* Recent Pages Section - if pages exist */}
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
