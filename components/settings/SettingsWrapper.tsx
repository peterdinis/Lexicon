"use client";

import { useQuery, useMutation } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRight,
	Building2,
	Loader2,
	Pencil,
	Settings,
	Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { GET_WORKSPACES } from "@/graphql/queries/workspaceQueries";
import {
	REMOVE_WORKSPACE,
	SET_CURRENT_WORKSPACE,
	UPDATE_WORKSPACE,
} from "@/graphql/mutations/workspaceMutations";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react"
import DashboardLayout from "../dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const SettingsWrapper: FC = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const { toast } = useToast();

	const { data, loading, error, refetch } = useQuery(GET_WORKSPACES, {
		variables: { query: {} },
	});

	const [switchWorkspace] = useMutation(SET_CURRENT_WORKSPACE);
	const [deleteWorkspace] = useMutation(REMOVE_WORKSPACE);
	const [updateWorkspace] = useMutation(UPDATE_WORKSPACE);

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
	const [editName, setEditName] = useState("");

	const workspaces = data?.workspaces?.items || [];

	// Switch workspace
	const handleSwitchWorkspace = async (workspaceId: string) => {
		try {
			await switchWorkspace({ variables: { workspaceId } });
			localStorage.setItem("currentWorkspaceId", workspaceId);
			toast({ title: "Workspace switched successfully." });
		} catch (err: any) {
			toast({ title: "Error switching workspace", description: err.message });
		}
	};

	// Delete workspace
	const handleDeleteWorkspace = async (workspaceId: string) => {
		try {
			await deleteWorkspace({ variables: { id: workspaceId } });
			toast({ title: "Workspace deleted" });
			refetch();
		} catch (err: any) {
			toast({ title: "Error deleting workspace", description: err.message });
		}
	};

	// Open edit dialog
	const openEditDialog = (workspace: any) => {
		setSelectedWorkspace(workspace);
		setEditName(workspace.name);
		setEditDialogOpen(true);
	};

	// Save updated workspace name
	const handleUpdateWorkspace = async () => {
		try {
			await updateWorkspace({
				variables: { id: selectedWorkspace.id, name: editName },
			});
			toast({ title: "Workspace updated" });
			setEditDialogOpen(false);
			refetch();
		} catch (err: any) {
			toast({ title: "Error updating workspace", description: err.message });
		}
	};

	return (
		<DashboardLayout>
			<header className="mb-6">
				<h1 className="text-2xl font-semibold flex items-center gap-2">
					<Settings className="h-5 w-5 text-muted-foreground" /> Settings
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Manage your workspace preferences.
				</p>
			</header>

			<section className="grid gap-6 md:grid-cols-2 animate-fade-in">
				<Card>
					<CardHeader>
						<CardTitle>Preferences</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor="pref-dark">Dark mode</Label>
							<Switch
								id="pref-dark"
								checked={resolvedTheme === "dark"}
								onCheckedChange={(checked) =>
									setTheme(checked ? "dark" : "light")
								}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Workspaces Table */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="w-5 h-5 text-muted-foreground" />
							All Workspaces
						</CardTitle>
					</CardHeader>
					<CardContent>
						{loading && (
							<div className="flex justify-center py-6">
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							</div>
						)}

						{error && (
							<p className="text-red-500 text-sm">
								Error loading workspaces: {error.message}
							</p>
						)}

						{!loading && !error && (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Updated</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<AnimatePresence>
										{workspaces.map((ws: {
											id: string;
											name: string;
											createdAt: string;
											updatedAt: string;
										}, index: number) => (
											<motion.tr
												key={ws.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												transition={{
													delay: index * 0.07,
													type: "spring",
													stiffness: 120,
												}}
												className="border-b"
											>
												<TableCell className="flex items-center gap-2">
													{
														["🚀", "💼", "🏢", "📂", "🛠️", "🌍", "📊"][
															index % 7
														]
													}
													{ws.name}
												</TableCell>
												<TableCell>
													{new Date(ws.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{new Date(ws.updatedAt).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right space-x-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleSwitchWorkspace(ws.id)}
													>
														Switch <ArrowRight className="w-4 h-4 ml-1" />
													</Button>
													<Button
														variant="secondary"
														size="sm"
														onClick={() => openEditDialog(ws)}
													>
														<Pencil className="w-4 h-4" />
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => handleDeleteWorkspace(ws.id)}
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</TableCell>
											</motion.tr>
										))}
									</AnimatePresence>
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</section>

			{/* Edit Workspace Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Workspace</DialogTitle>
					</DialogHeader>
					<Input
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
						placeholder="Workspace name"
					/>
					<DialogFooter>
						<Button variant="secondary" onClick={() => setEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpdateWorkspace}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</DashboardLayout>
	);
};

export default SettingsWrapper;
