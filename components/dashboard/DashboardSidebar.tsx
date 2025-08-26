"use client";

import {
	CheckSquare,
	LayoutGrid,
	LayoutTemplate,
	Plus,
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
import { useMutation } from "@apollo/client";
import { CREATE_WORKSPACE } from "@/graphql/mutations/workspaces/workspaceMutations";
import { useToast } from "@/hooks/shared/use-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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

	const [createWorkspace, { loading, error }] = useMutation(CREATE_WORKSPACE, {
		onCompleted: (data) => {
			setNewWorkspaceName("");
			setOpen(false);
			toast({
				title: "New workspace is created",
				duration: 2000,
				className: "bg-green-800 text-white font-bold text-xl",
			});
		},
		onError: (error) => {
			console.error("Error creating workspace:", error);
			toast({
				title: "New workspace was not created",
				duration: 2000,
				className: "bg-red-800 text-white font-bold text-xl",
			});
		},
	});

	const handleCreateWorkspace = () => {
		if (!newWorkspaceName.trim()) return;

		createWorkspace({
			variables: {
				input: {
					name: newWorkspaceName.trim(),
				},
			},
		});

		toast({
			title: "New workspace is created",
			duration: 2000,
			className: "bg-green-800 text-white font-bold text-xl",
		});
	};

	return (
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
										<Link href="/page">
											<span className="mr-2 grid h-4 w-4 place-items-center">
												+
											</span>
											{!collapsed && <span>New page</span>}
										</Link>
									</SidebarMenuButton>,
								)}
							</SidebarMenuItem>

							<SidebarMenuItem>
								{renderWithTooltip(
									"New Workspace",
									<SidebarMenuButton asChild>
										<Link href="/page">
											<span className="mr-2 grid h-4 w-4 place-items-center">
												+
											</span>
											{!collapsed && <span>New workspace</span>}
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


				<SidebarGroup>
					<SidebarGroupLabel>Workspaces</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								{renderWithTooltip(
									"New Workspace",
									<SidebarMenuButton asChild>
										<span className="mr-2 grid h-4 w-4 place-items-center">
											+
										</span>
										{!collapsed && <span>New workspace</span>}
									</SidebarMenuButton>,
								)}
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<div className="flex gap-2 ml-auto flex-wrap sm:flex-nowrap">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button
							variant="default"
							disabled={loading}
							className="flex-1 sm:flex-none"
						>
							<Plus className="mr-2 h-4 w-4" />
							New Workspace
						</Button>
					</DialogTrigger>
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
			</div>
		</Sidebar>
	);
};

export default DashboardSidebar;
