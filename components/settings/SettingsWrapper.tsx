"use client";

import { useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Loader2, Settings, Trash2, UserIcon } from "lucide-react";
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
import {
	DELETE_PROFILE,
	UPDATE_PROFILE,
} from "@/graphql/mutations/auth/profileMutations";
import { ME_QUERY } from "@/graphql/queries/auth/authQueries";
import { GET_WORKSPACES } from "@/graphql/queries/workspaces/workspaceQueries";
<<<<<<< HEAD
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { DialogHeader, DialogFooter } from "../ui/dialog";
=======
import DashboardLayout from "../dashboard/DashboardLayout";
import { Input } from "../ui/input";
>>>>>>> main

const SettingsWrapper: FC = () => {
	const { resolvedTheme, setTheme } = useTheme();

	const { data, loading, error } = useQuery(GET_WORKSPACES, {
		variables: { query: {} },
	});

	const workspaces = data?.workspaces?.items || [];

	const handleSwitchWorkspace = (workspaceId: string) => {
		// Placeholder for actual logic
		console.log(`Switching to workspace: ${workspaceId}`);
		// Example: save to localStorage
		localStorage.setItem("currentWorkspaceId", workspaceId);
		// You can also trigger a mutation or a router refresh here
	};

	return (
		<DashboardLayout>
			<header className="mb-6">
				<h1 className="text-2xl font-semibold flex items-center gap-2">
					<Settings className="h-5 w-5 text-muted-foreground" /> Settings
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Manage your workspace preferences and profile.
				</p>
			</header>

			<section className="grid gap-6 md:grid-cols-3 animate-fade-in">
				{/* Preferences Card */}
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
						{wsLoading && (
							<div className="flex justify-center py-6">
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							</div>
						)}

						{wsError && (
							<p className="text-red-500 text-sm">
								Error loading workspaces: {wsError.message}
							</p>
						)}

						{!wsLoading && !wsError && (
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
												whileHover={{
													scale: 1.02,
													backgroundColor: "rgba(0,0,0,0.05)",
												}}
												className="border-b cursor-pointer"
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
												<TableCell className="text-right">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleSwitchWorkspace(ws.id)}
														className="flex items-center gap-1"
													>
														Switch <ArrowRight className="w-4 h-4" />
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

				{/* Profile Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="w-5 h-5 text-muted-foreground" />
							Profile Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{meLoading ? (
							<div className="flex justify-center py-4">
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							</div>
						) : (
							<>
								<div className="space-y-2">
									<Label>Name</Label>
									<Input
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Last Name</Label>
									<Input
										value={formData.lastName}
										onChange={(e) =>
											setFormData({ ...formData, lastName: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Photo URL</Label>
									<Input
										value={formData.photoUrl}
										onChange={(e) =>
											setFormData({ ...formData, photoUrl: e.target.value })
										}
									/>
								</div>
								<Button
									onClick={handleUpdateProfile}
									disabled={updating}
									className="w-full"
								>
									{updating ? "Updating..." : "Update Profile"}
								</Button>
								<Button
									variant="destructive"
									onClick={handleDeleteProfile}
									disabled={deleting}
									className="w-full flex items-center gap-2"
								>
									<Trash2 className="w-4 h-4" />
									{deleting ? "Deleting..." : "Delete Profile"}
								</Button>
							</>
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
