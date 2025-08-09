"use client"

import { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: ReactNode }) {
  const handleNewPage = () => {
    //TODO
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="h-14 flex items-center gap-3 border-b px-3">
            <SidebarTrigger />
            <div className="flex-1 max-w-xl">
              <Input placeholder="Search your workspace" />
            </div>
            <div className="ml-auto">
              <Button variant="default" onClick={handleNewPage}>New Page</Button>
            </div>
          </header>
          <div className="p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
