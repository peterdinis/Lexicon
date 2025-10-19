import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { getAllPagesHandler } from "@/actions/handlers/pageHandlers";

export default async function DashboardPage() {
  let pages = [];

  try {
    // Directly call the handler since we're in a server component
    pages = await getAllPagesHandler();
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardTopBar />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar initialPages={pages} />
        <main className="flex flex-1 items-center justify-center">
          <AnimatedPageWrapper>
            <div className="text-center">
              <h1 className="text-4xl mt-32 font-semibold text-muted-foreground">
                Select a page or create a new one
              </h1>
            </div>
          </AnimatedPageWrapper>
        </main>
      </div>
    </div>
  );
}
