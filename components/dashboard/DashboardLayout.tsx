"use client";

import { Search } from "lucide-react";
import {
	type ReactNode,
	useState,
	unstable_ViewTransition as ViewTransition,
} from "react";
import { Button } from "@/components/ui/button";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import SearchDialog from "../shared/SearchDialog";
import DashboardSidebar from "./DashboardSidebar";
import ProfileDropdown from "../auth/UpdateProfileDropdown";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const [searchOpen, setSearchOpen] = useState(false);

	return (
		<ViewTransition enter={"slide-in"}>
			<SidebarProvider>
				<div className="flex min-h-screen w-full">
					<DashboardSidebar />
					<SidebarInset>
						<header className="h-auto min-h-14 flex flex-wrap md:flex-nowrap items-center gap-3 border-b px-3 py-2">
							<div className="flex items-center gap-2 flex-1 min-w-[200px]">
								<SidebarTrigger />
								<Button
									variant="outline"
									onClick={() => setSearchOpen(true)}
									className="hidden sm:flex"
								>
									<Search className="h-4 w-4 mr-2" /> Search
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setSearchOpen(true)}
									className="sm:hidden"
								>
									<Search className="h-4 w-4" />
								</Button>

								<SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
							</div>
							<ProfileDropdown />
						</header>
						<div className="p-6">{children}</div>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</ViewTransition>
	);
}
