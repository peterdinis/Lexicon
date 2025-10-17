import DashboardTopBar from "./DashboardTopBar";
import { redirect } from "next/navigation";
import { AnimatedPageWrapper } from "../shared/AnimatedPageWrapper";
import { DashboardSidebar } from "./DashboardSidebar";
import { fetchDashboardDataAction } from "@/actions/dashboardActions";

export default async function DashboardPage() {
  let user;
  let pages;

  try {
    const result = await fetchDashboardDataAction();
    user = result.user;
    pages = result.pages;
  } catch (err) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardTopBar />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar initialPages={pages || []} />
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
