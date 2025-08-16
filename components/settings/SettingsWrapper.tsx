"use client";

import { useMutation, useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRight,
	Building2,
	Loader2,
	Settings,
	Trash2,
	UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { FC, useEffect, useState } from "react";
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
import { Input } from "../ui/input";

import {
	DELETE_PROFILE,
	UPDATE_PROFILE,
} from "@/graphql/mutations/auth/profileMutations";
import { SWITCH_WORKSPACE } from "@/graphql/mutations/workspaces/workspaceMutations";
import { ME_QUERY } from "@/graphql/queries/auth/authQueries";
import {
	GET_WORKSPACES,
	GET_CURRENT_WORKSPACE,
} from "@/graphql/queries/workspaces/workspaceQueries";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const SettingsWrapper: FC = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const { toast } = useToast();

	// Workspaces query
	const {
		data: wsData,
		loading: wsLoading,
		error: wsError,
		refetch: refetchWorkspaces,
	} = useQuery(GET_WORKSPACES);
	const workspaces = wsData?.workspaces?.items || [];

	// Current workspace query
	const { data: currentWorkspaceData, refetch: refetchCurrentWorkspace } =
		useQuery(GET_CURRENT_WORKSPACE);
	const currentWorkspaceId = currentWorkspaceData?.currentWorkspace?.id;

	// Me query
	const { data: meData, loading: meLoading } = useQuery(ME_QUERY);
	const currentUser = meData?.me;

	const [updateProfile] = useMutation(UPDATE_PROFILE, {
		refetchQueries: ["Me"],
	});
	const [deleteProfile] = useMutation(DELETE_PROFILE);

	const [switchWorkspaceMutation, { loading: switchLoading }] = useMutation(
		SWITCH_WORKSPACE,
		{
			refetchQueries: ["CurrentWorkspace"],
		}
	);

	const [formData, setFormData] = useState({
		name: "",
		lastName: "",
		photoUrl: "",
	});

	useEffect(() => {
		if (currentUser) {
			setFormData({
				name: currentUser.name || "",
				lastName: currentUser.lastName || "",
				photoUrl: currentUser.photoUrl || "",
			});
		}
	}, [currentUser]);

	const handleSwitchWorkspace = async (workspaceId: number) => {
		if (!currentUser) return;

		try {
			await switchWorkspaceMutation({
				variables: { userId: Number(currentUser.id), workspaceId },
			});

			toast({
				title: "Switched workspace",
				duration: 2000,
				className: "bg-green-800 text-white font-bold text-base",
			});

			await refetchWorkspaces();
			await refetchCurrentWorkspace();
		} catch (err: any) {
			toast({
				title: "Failed to switch workspace",
				description: err.message,
				duration: 2000,
				className: "bg-red-800 text-white font-bold text-base",
			});
		}
	};

	const handleUpdateProfile = async () => {
		try {
			await updateProfile({ variables: { data: formData } });
			toast({
				title: "Profile Updated",
				duration: 2000,
				className: "bg-green-800 text-white font-bold text-base",
			});
		} catch {
			toast({
				title: "Profile update failed",
				duration: 2000,
				className: "bg-red-800 text-white font-bold text-base",
			});
		}
	};

	const handleDeleteProfile = async () => {
		if (
			confirm(
				"Are you sure you want to delete your profile? This action cannot be undone."
			)
		) {
			await deleteProfile();
			toast({
				title: "Deleting profile",
				duration: 2000,
				className: "bg-green-800 text-white font-bold text-base",
			});
			localStorage.removeItem("token");
			window.location.href = "/login";
		}
	};

	return (
		<DashboardLayout>
			<header className="mb-8">
				<h1 className="text-3xl font-bold flex items-center gap-3">
					<Settings className="h-6 w-6 text-muted-foreground" /> Settings
				</h1>
				<p className="text-sm text-muted-foreground mt-2">
					Manage your workspace preferences and profile.
				</p>
			</header>

			<section className="grid gap-8 md:grid-cols-3">
				{/* Preferences Card */}
				<Card className="shadow-lg border-gray-100">
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
				<Card className="shadow-lg border-gray-100 col-span-3 md:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="w-5 h-5 text-muted-foreground" /> Workspaces
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

						{!wsLoading && !wsError && workspaces.length > 0 && (
							<Table className="text-sm">
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead className="text-right">Action</TableHead>
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
												transition={{ delay: index * 0.05 }}
												whileHover={{
													scale: 1.02,
													backgroundColor: "rgba(0,0,0,0.03)",
												}}
												className="border-b cursor-pointer"
											>
												<TableCell className="flex items-center gap-2">
													<span>
														{["🚀", "💼", "🏢", "📂", "🛠️", "🌍", "📊"][
															index % 7
														]}
													</span>
													{ws.name}
													{ws.id === currentWorkspaceId && (
														<span className="ml-2 text-xs text-green-500 font-semibold">
															(current)
														</span>
													)}
												</TableCell>
												<TableCell className="text-right">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleSwitchWorkspace(ws.id)}
														disabled={switchLoading}
													>
														{switchLoading ? (
															<Loader2 className="w-4 h-4 animate-spin" />
														) : (
															<>
																Switch{" "}
																<ArrowRight className="w-4 h-4" />
															</>
														)}
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
				<Card className="shadow-lg border-gray-100 col-span-3 md:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="w-5 h-5 text-muted-foreground" /> Profile
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{meLoading ? (
							<div className="flex justify-center py-4">
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							</div>
						) : (
							<>
								<div className="flex flex-col md:flex-row gap-4 items-center">
									<img
										src={formData.photoUrl || "/default-avatar.png"}
										alt="Profile"
										className="w-16 h-16 rounded-full object-cover border"
									/>
									<div className="flex-1 space-y-2 w-full">
										<div>
											<Label>Name</Label>
											<Input
												value={formData.name}
												onChange={(e) =>
													setFormData({
														...formData,
														name: e.target.value,
													})
												}
											/>
										</div>
										<div>
											<Label>Last Name</Label>
											<Input
												value={formData.lastName}
												onChange={(e) =>
													setFormData({
														...formData,
														lastName: e.target.value,
													})
												}
											/>
										</div>
										<div>
											<Label>Photo URL</Label>
											<Input
												value={formData.photoUrl}
												onChange={(e) =>
													setFormData({
														...formData,
														photoUrl: e.target.value,
													})
												}
											/>
										</div>
									</div>
								</div>
								<div className="flex gap-2 mt-4">
									<Button onClick={handleUpdateProfile} variant="default">
										Update Profile
									</Button>
									<Button
										onClick={handleDeleteProfile}
										variant="destructive"
									>
										Delete Profile
									</Button>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</section>
		</DashboardLayout>
	);
};

export default SettingsWrapper;
