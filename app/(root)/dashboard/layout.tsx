"use client";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";

import { redirect } from "next/navigation";

const MainLayOut = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) {
    return (
      <div className="h-full min-h-[100vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }
  return (
    <div className="h-full flex dark:bg-[#1f1f1f] ">
      <DashboardSidebar />
      <main className="flex-1 h-full overflow-y-auto">
        Search Dialog
        {children}
      </main>
    </div>
  );
};

export default MainLayOut;
