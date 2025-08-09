"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const handleNewPage = () => {
		//TODO
	};

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<DashboardSidebar />
				<SidebarInset>
					<header className="h-14 flex items-center gap-3 border-b px-3">
						<SidebarTrigger />
						<div className="flex-1 max-w-xl">
							<Input placeholder="Search your workspace" />
						</div>
						<div className="ml-auto">
							<Button variant="default" onClick={handleNewPage}>
								New Page
							</Button>
						</div>
					</header>
					<div className="p-6">{children}</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
