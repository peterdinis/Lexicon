"use client";

import {
	CheckSquare,
	LayoutGrid,
	LayoutTemplate,
	Settings,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { listPages, pagesEvents } from "@/store/pageStore";

const items = [
	{ title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
	{ title: "Tasks", url: "/tasks", icon: CheckSquare },
	{ title: "Templates", url: "/templates", icon: LayoutTemplate },
	{ title: "Settings", url: "/settings", icon: Settings },
];

const DashboardSidebar: FC = () => {
	const { state } = useSidebar();
	const collapsed = state === "collapsed";
	const [pages, setPages] = useState(() => listPages());

	useEffect(() => {
		const onUpdate = () => setPages(listPages());
		window.addEventListener(pagesEvents.eventName, onUpdate);
		return () => window.removeEventListener(pagesEvents.eventName, onUpdate);
	}, []);

	const renderWithTooltip = (label: string, children: React.ReactNode) => {
		if (!collapsed) return children;
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>{children}</TooltipTrigger>
					<TooltipContent side="right">{label}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	};

	return (
		<Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
			<SidebarContent>
				{/* Workspace Section */}
				<SidebarGroup>
					<SidebarGroupLabel>Workspace</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									{renderWithTooltip(
										item.title,
										<SidebarMenuButton asChild>
											<Link href={item.url}>
												<item.icon className="mr-2 h-4 w-4" />
												{!collapsed && <span>{item.title}</span>}
											</Link>
										</SidebarMenuButton>,
									)}
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Pages Section */}
				<SidebarGroup>
					<SidebarGroupLabel>Pages</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{/* New Page Button */}
							<SidebarMenuItem>
								{renderWithTooltip(
									"New page",
									<SidebarMenuButton asChild>
										<Link href="#">
											<span className="mr-2 grid h-4 w-4 place-items-center">
												+
											</span>
											{!collapsed && <span>New page</span>}
										</Link>
									</SidebarMenuButton>,
								)}
							</SidebarMenuItem>

							{/* Page List */}
							{pages.slice(0, 12).map((p) => (
								<SidebarMenuItem key={p.id}>
									{renderWithTooltip(
										p.title || "Untitled",
										<SidebarMenuButton asChild>
											<Link href={`/pages/${p.id}`}>
												<span className="mr-2 h-4 w-4 grid place-items-center">
													📄
												</span>
												{!collapsed && (
													<span
														className="truncate"
														title={p.title || "Untitled"}
													>
														{p.title || "Untitled"}
													</span>
												)}
											</Link>
										</SidebarMenuButton>,
									)}
								</SidebarMenuItem>
							))}

							{/* Trash */}
							<SidebarMenuItem>
								{renderWithTooltip(
									"Trash",
									<SidebarMenuButton asChild>
										<Link href="/trash">
											<Trash2 className="mr-2 h-4 w-4" />
											{!collapsed && <span>Trash</span>}
										</Link>
									</SidebarMenuButton>,
								)}
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
};

export default DashboardSidebar;
