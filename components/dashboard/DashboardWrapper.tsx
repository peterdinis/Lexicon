import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { fetchDashboardDataAction } from "@/actions/dashboardActions";

export default async function DashboardPage() {
  let pages = [];
  let user;

  try {
    // fetchDashboardDataAction now returns { user, pages }
    const result = await fetchDashboardDataAction();

    // No need to access result.data — just destructure
    user = result.user;
    pages = result.pages;

    // Redirect if user is not found (unauthorized)
    if (!user) redirect("/auth/login");
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
