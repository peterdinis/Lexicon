"use client"

import { Database, FileText, Kanban } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPage } from "@/store/pageStore";
import DashboardLayout from "../dashboard/DashboardLayout";
import DashboardWrapper from "../dashboard/DashboardWrapper";

const TemplatesWrapper: FC = () => {
	const router = useRouter();

	const templates = [
		{
			icon: FileText,
			title: "Meeting Notes",
			desc: "Capture agendas and outcomes",
		},
		{ icon: Kanban, title: "Kanban Board", desc: "Track tasks visually" },
		{ icon: Database, title: "Database", desc: "Structure anything" },
	] as const;

	const makeContent = (title: string) => {
		switch (title) {
			case "Meeting Notes":
				return `<h1>Meeting Notes</h1><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><h2>Agenda</h2><ul><li>Topic 1</li><li>Topic 2</li></ul><h2>Notes</h2><p>Capture key decisions and action items.</p><h2>Action Items</h2><ul><li>[ ] Owner – Task – Due</li></ul>`;
			case "Kanban Board":
				return `<h1>Kanban Board</h1><p>Create columns and list tasks under each.</p><h2>To Do</h2><ul><li>Task A</li></ul><h2>In Progress</h2><ul><li>Task B</li></ul><h2>Done</h2><ul><li>Task C</li></ul>`;
			case "Database":
				return `<h1>Database</h1><p>Outline your properties and entries below.</p><ul><li>Property: Status</li><li>Property: Owner</li></ul>`;
			default:
				return "";
		}
	};

	const useTemplate = (title: string) => {
		const page = createPage({ title, content: makeContent(title) });
		router.push(`/pages/${page.id}`);
	};

	return (
		<DashboardLayout>
			<header className="mb-6">
				<h1 className="text-2xl font-semibold flex items-center gap-2">
					Templates
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{" "}
					Pick a template to get started quickly.
				</p>
			</header>

			<section className="animate-fade-in">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{templates.map((t) => (
						<Card key={t.title} className="hover-scale">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<t.icon className="h-5 w-5 text-muted-foreground" /> {t.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground"> {t.desc} </p>
								<div className="mt-4">
									<Button
										size="sm"
										variant="outline"
										onClick={() => useTemplate(t.title)}
									>
										{" "}
										Use template{" "}
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</DashboardLayout>
	);
};

export default TemplatesWrapper;
