"use client";

import { useMutation } from "@apollo/client";
import { Plus, Search } from "lucide-react";
import {
	type ReactNode,
	useState,
	unstable_ViewTransition as ViewTransition,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { CREATE_WORKSPACE } from "@/graphql/mutations/workspaces/workspaceMutations";
import ProfileDropdown from "../auth/ProfileDropdown";
import SearchDialog from "../shared/SearchDialog";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [newWorkspaceName, setNewWorkspaceName] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);

	const [createWorkspace, { loading, error }] = useMutation(CREATE_WORKSPACE, {
		onCompleted: (data) => {
			console.log("Workspace created:", data.createWorkspace);
			setNewWorkspaceName("");
			setOpen(false);
			toast.success("New workspace was created");
		},
		onError: (error) => {
			console.error("Error creating workspace:", error);
			toast.error("Failed to create new workspace");
		},
	});

	const handleNewPage = () => {
		// TODO: Implement New Page creation
	};

	const handleCreateWorkspace = () => {
		if (!newWorkspaceName.trim()) return;

		createWorkspace({
			variables: {
				input: {
					name: newWorkspaceName.trim(),
				},
			},
		});
	};

	return (
		<ViewTransition enter={"slide-in"}>
			<SidebarProvider>
				<div className="flex min-h-screen w-full">
					<DashboardSidebar />
					<SidebarInset>
						<header className="h-14 flex items-center gap-3 border-b px-3">
							<SidebarTrigger />
							<div className="flex-1">
								<Button variant="outline" onClick={() => setSearchOpen(true)}>
									<Search className="h-4 w-4 mr-2" /> Search
								</Button>

								<SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
							</div>

							<div className="flex gap-2 ml-auto">
								<Button variant="default" onClick={handleNewPage}>
									New Page
								</Button>

								<Dialog open={open} onOpenChange={setOpen}>
									<DialogTrigger asChild>
										<Button variant="default" disabled={loading}>
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

							<ProfileDropdown />
						</header>
						<div className="p-6">{children}</div>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</ViewTransition>
	);
}
