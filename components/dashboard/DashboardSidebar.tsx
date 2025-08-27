"use client";

import {
	CheckSquare,
	FilePlus2,
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
import { useToast } from "@/hooks/shared/use-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCreateWorkspace } from "@/hooks/workspces/useCreateNewWorkspace";

const items = [
	{ title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
	{ title: "Tasks", url: "/tasks", icon: CheckSquare },
	{ title: "Templates", url: "/templates", icon: LayoutTemplate },
	{ title: "Settings", url: "/settings", icon: Settings },
	{ title: "Notes", url: "/notes", icon: CheckSquare },
];

const DashboardSidebar: FC = () => {
	const { state } = useSidebar();
	const collapsed = state === "collapsed";
	const [pages, setPages] = useState(() => listPages());
	const [newWorkspaceName, setNewWorkspaceName] = useState("");
	const [open, setOpen] = useState(false);
	const { toast } = useToast();

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

	const { createWorkspace, loading, error } = useCreateWorkspace({
		onSuccess: () => {
			setNewWorkspaceName("");
			setOpen(false);
		},
	});

	const handleCreateWorkspace = () => {
		if (!newWorkspaceName.trim()) return;

		createWorkspace({
			variables: {
				input: { name: newWorkspaceName.trim() },
			},
		});
	};

	return (
		<>
			<Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
				<SidebarContent>
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
													<item.icon className="h-4 w-4" />
													{!collapsed && <span>{item.title}</span>}
												</Link>
											</SidebarMenuButton>,
										)}
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{/* New Page */}
								<SidebarMenuItem>
									{renderWithTooltip(
										"New page",
										<SidebarMenuButton asChild>
											<Link href="/page">
												<span className="grid h-4 w-4 place-items-center">
													P
												</span>
												{!collapsed && <span>New page</span>}
											</Link>
										</SidebarMenuButton>,
									)}
								</SidebarMenuItem>

								{/* New Workspace (opens dialog) */}
								<SidebarMenuItem>
									{renderWithTooltip(
										"New Workspace",
										<SidebarMenuButton onClick={() => setOpen(true)}>
											<span className="grid h-4 w-4 place-items-center">
												W
											</span>
											{!collapsed && <span>New workspace</span>}
										</SidebarMenuButton>,
									)}
								</SidebarMenuItem>

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

			{/* Dialog mimo sidebar */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Workspace</DialogTitle>
						<DialogDescription>
							Enter a name for your new workspace. You can manage its
							settings later.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Input
							placeholder="Workspace Name"
							value={newWorkspaceName}
							onChange={(e) => setNewWorkspaceName(e.target.value)}
							autoFocus
							disabled={loading}
						/>
					</div>
					<DialogFooter>
						<Button
							onClick={handleCreateWorkspace}
							disabled={!newWorkspaceName.trim() || loading}
						>
							{loading ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
					{error && (
						<p className="text-red-600 mt-2 text-sm">
							Error creating workspace: {error.message}
						</p>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default DashboardSidebar;
