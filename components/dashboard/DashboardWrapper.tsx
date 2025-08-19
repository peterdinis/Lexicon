"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { type FC, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "./DashboardLayout";
import { useGetAllTemplates } from "@/hooks/templates/useGetAllTemplates";

const DashboardWrapper: FC = () => {
	const [note, setNote] = useState("");
	const [filter, setFilter] = useState("");

	const {templates: templateData, loading: templateLoading, error: templateError} = useGetAllTemplates()
	const recents = useMemo(
		() => [
			{
				emoji: "🗒️",
				title: "Weekly Planning",
				tag: "Planning",
				color: "blue" as const,
				updated: "2h ago",
			},
			{
				emoji: "🎯",
				title: "Q3 Objectives",
				tag: "OKRs",
				color: "purple" as const,
				updated: "yesterday",
			},
			{
				emoji: "🧪",
				title: "User Research Notes",
				tag: "Research",
				color: "green" as const,
				updated: "2 days ago",
			},
			{
				emoji: "📦",
				title: "Roadmap",
				tag: "Product",
				color: "orange" as const,
				updated: "3 days ago",
			},
		],
		[],
	);


	const mockTasks = [
		{ id: 1, title: "Design homepage", status: "To do" },
		{ id: 2, title: "Implement login API", status: "In progress" },
		{ id: 3, title: "Write tests for dashboard", status: "Done" },
		{ id: 4, title: "Setup analytics", status: "To do" },
		{ id: 5, title: "Fix bug #112", status: "In progress" },
		{ id: 6, title: "Design homepage", status: "To do" },
		{ id: 7, title: "Implement login API", status: "In progress" },
		{ id: 8, title: "Write tests for dashboard", status: "Done" },
		{ id: 9, title: "Setup analytics", status: "To do" },
		{ id: 10, title: "Fix bug #112", status: "In progress" },
		{ id: 11, title: "Fix bug #112", status: "In progress" },
		{ id: 12, title: "Design homepage", status: "To do" },
		{ id: 13, title: "Implement login API", status: "In progress" },
		{ id: 14, title: "Write tests for dashboard", status: "Done" },
		{ id: 15, title: "Setup analytics", status: "To do" },
		{ id: 16, title: "Fix bug #112", status: "In progress" },
		{ id: 17, title: "Design homepage", status: "To do" },
		{ id: 18, title: "Implement login API", status: "In progress" },
		{ id: 19, title: "Write tests for dashboard", status: "Done" },
		{ id: 20, title: "Setup analytics", status: "To do" },
		{ id: 21, title: "Fix bug #112", status: "In progress" },
	];

	const badgeCls = (color: (typeof recents)[number]["color"]) => {
		switch (color) {
			case "blue":
				return "bg-notion-blue/15 text-notion-blue border border-notion-blue/20";
			case "purple":
				return "bg-notion-purple/15 text-notion-purple border border-notion-purple/20";
			case "green":
				return "bg-notion-green/15 text-notion-green border border-notion-green/20";
			case "orange":
				return "bg-notion-orange/15 text-notion-orange border border-notion-orange/20";
			default:
				return "bg-muted text-foreground border border-border";
		}
	};

	const filteredRecents = recents.filter((r) =>
		r.title.toLowerCase().includes(filter.toLowerCase()),
	);

	if(templateLoading) return <Loader2 className="animate-spin w-8 h-8" />

	if(templateError) return <p className="text-red-800 text-xl font-bold">Failed to load templates</p>

	console.log(templateData.getTemplates)

	return (
		<DashboardLayout>
			<header className="mb-6">
				<h1 className="text-2xl font-semibold flex items-center gap-2">
					<Star className="h-5 w-5 text-muted-foreground" /> Dashboard
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Welcome back — continue where you left off.
				</p>
			</header>

			<section className="grid gap-6 md:grid-cols-3 animate-fade-in">
				<Card className="md:col-span-2">
					<CardHeader className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<CalendarRange className="h-4 w-4" /> Recent
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-4">
							<Input
								placeholder="Filter recent pages..."
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
							/>
						</div>
						<ul className="space-y-2">
							{filteredRecents.map((r) => (
								<li
									key={r.title}
									className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/60 transition-colors"
								>
									<div className="flex items-center gap-3 min-w-0">
										<span className="text-lg select-none">{r.emoji}</span>
										<a
											className="truncate story-link"
											href="#"
											onClick={(e) => {
												e.preventDefault();
												toast("Connect Supabase to open pages.");
											}}
										>
											{r.title}
										</a>
									</div>
									<div className="flex items-center gap-3">
										<span
											className={`hidden sm:inline-block text-xs rounded-md px-2 py-0.5 ${badgeCls(
												r.color,
											)}`}
										>
											{r.tag}
										</span>
										<span className="text-xs text-muted-foreground shrink-0">
											Edited {r.updated}
										</span>
									</div>
								</li>
							))}
							{filteredRecents.length === 0 && (
								<li className="text-sm text-muted-foreground">No results.</li>
							)}
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Quick note</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Textarea
							placeholder="Jot something down..."
							value={note}
							onChange={(e) => setNote(e.target.value)}
							className="min-h-32"
						/>
						<div className="flex justify-end">
							<Button
								onClick={() =>
									toast("Connect Supabase to save your notes across sessions.")
								}
							>
								Save note
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>

			<section className="mt-8 grid gap-6 md:grid-cols-2 animate-fade-in">
				<Card>
					<CardHeader>
						<CardTitle>Calendar</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="p-4 ounded-lg shadow-md w-full h-auto select-none">
							<CalendarUI className="w-full h-full rounded-md" />
						</div>
						<div className="mt-4 ml-3">
							<Button variant="outline" size="sm" asChild>
								<Link href="/calendar">Open Events in Calendar</Link>
							</Button>
							<Button variant="outline" size="sm" asChild className="ml-4">
								<Link href="/calendar">Add new event to calendar</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tasks</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm">
							<li className="flex items-center justify-between">
								<span>To do</span>
								<span className="text-muted-foreground">5</span>
							</li>
							<li className="flex items-center justify-between">
								<span>In progress</span>
								<span className="text-muted-foreground">2</span>
							</li>
							<li className="flex items-center justify-between">
								<span>Done</span>
								<span className="text-muted-foreground">8</span>
							</li>
						</ul>

						{/* Animated tasks table */}
						<div className="mt-4 overflow-hidden rounded border border-border">
							<table className="w-full text-left text-sm">
								<thead className="bg-muted text-muted-foreground">
									<tr>
										<th className="px-3 py-2">Task</th>
										<th className="px-3 py-2">Status</th>
									</tr>
								</thead>
								<tbody>
									<AnimatePresence>
										{mockTasks.map((task) => (
											<motion.tr
												key={task.id}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 20 }}
												transition={{ duration: 0.3 }}
												className="border-t border-border"
											>
												<td className="px-3 py-2">{task.title}</td>
												<td className="px-3 py-2">{task.status}</td>
											</motion.tr>
										))}
									</AnimatePresence>
								</tbody>
							</table>
						</div>

						<div className="mt-4">
							<Button size="sm" asChild>
								<Link href="/tasks">Open Tasks</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>

			<section className="mt-8 animate-fade-in">
				<Card>
					<CardHeader>
						<CardTitle>Templates</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{templateData && templateData?.map((t: {
								title: string
								desc: string
							}) => (
								<div
									key={t.title}
									className="border rounded-md p-4 hover-scale transition-transform hover:scale-[1.02]"
								>
									<div className="flex items-start gap-3">
										<div>
											<div className="font-medium">{t.title}</div>
											<div className="text-sm text-muted-foreground">
												{t.desc}
											</div>
										</div>
									</div>
									<div className="mt-4">
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												toast(
													`${t.title} template will be available after connecting Supabase.`,
												)
											}
										>
											Use template
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</section>
		</DashboardLayout>
	);
};

export default DashboardWrapper;
