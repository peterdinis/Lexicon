"use client";

import { Settings, Loader2, Building2, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import type { FC } from "react";
import { useQuery } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DashboardLayout from "../dashboard/DashboardLayout";
import { GET_WORKSPACES } from "@/graphql/queries/workspaceQueries";

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
								className="transition-colors duration-300 ease-in-out"
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
														{["🚀", "💼", "🏢", "📂", "🛠️", "🌍", "📊"][
															index % 7
														]}
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
														onClick={() =>
															handleSwitchWorkspace(ws.id)
														}
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
			</section>
		</DashboardLayout>
	);
};

export default SettingsWrapper;
