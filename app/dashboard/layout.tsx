"use client";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useConvexAuth } from "convex/react";
import { Loader2, Menu } from "lucide-react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
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
    <div className="h-full flex dark:bg-[#1f1f1f] min-h-screen">
      <DashboardSidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <motion.nav
          className="bg-background/80 backdrop-blur-sm border-b px-4 py-2 flex items-center"
          layout
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </motion.nav>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;