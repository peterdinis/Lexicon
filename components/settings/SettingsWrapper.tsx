"use client";

import { useQuery, useMutation } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRight,
	Building2,
	Loader2,
	Settings,
	Pencil,
	Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, type FC } from "react";
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
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
	GET_WORKSPACES,
} from "@/graphql/queries/workspaceQueries";
import DashboardLayout from "../dashboard/DashboardLayout";
import { REMOVE_WORKSPACE, SET_CURRENT_WORKSPACE, UPDATE_WORKSPACE } from "@/graphql/mutations/workspaceMutations";

const SettingsWrapper: FC = () => {
	const { resolvedTheme, setTheme } = useTheme();

	const { data, loading, error, refetch } = useQuery(GET_WORKSPACES, {
		variables: { query: {} },
	});

	const [switchWorkspace] = useMutation(SET_CURRENT_WORKSPACE);
	const [updateWorkspace] = useMutation(UPDATE_WORKSPACE);
	const [deleteWorkspace] = useMutation(REMOVE_WORKSPACE);

	const workspaces = data?.workspaces?.items || [];

	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
	const [editName, setEditName] = useState("");

	const handleSwitchWorkspace = async (workspaceId: string) => {
		await switchWorkspace({ variables: { id: workspaceId } });
		localStorage.setItem("currentWorkspaceId", workspaceId);
		refetch();
	};

	const handleEditWorkspace = async () => {
		await updateWorkspace({
			variables: { id: selectedWorkspace.id, input: { name: editName } },
		});
		setEditOpen(false);
		refetch();
	};

	const handleDeleteWorkspace = async () => {
		await deleteWorkspace({ variables: { id: selectedWorkspace.id } });
		setDeleteOpen(false);
		refetch();
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

				{/* Workspaces Card */}
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
										{workspaces.map((ws, index) => (
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
													<span>
														{
															["🚀", "💼", "🏢", "📂", "🛠️", "🌍", "📊"][
																index % 7
															]
														}
													</span>
													{ws.name}
												</TableCell>
												<TableCell>
													{new Date(ws.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{new Date(ws.updatedAt).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right flex gap-2 justify-end">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleSwitchWorkspace(ws.id)}
													>
														<ArrowRight className="w-4 h-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															setSelectedWorkspace(ws);
															setEditName(ws.name);
															setEditOpen(true);
														}}
													>
														<Pencil className="w-4 h-4" />
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => {
															setSelectedWorkspace(ws);
															setDeleteOpen(true);
														}}
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
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
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
						<Button onClick={handleEditWorkspace}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Workspace Dialog */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this workspace?
						</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-500 text-white hover:bg-red-600"
							onClick={handleDeleteWorkspace}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DashboardLayout>
	);
};

export default SettingsWrapper;
