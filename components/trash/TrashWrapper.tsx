"use client"

import { RotateCcw, Trash2 } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	deletePagePermanent,
	listTrashedPages,
	type Page,
	pagesEvents,
	restorePage,
} from "@/store/pageStore";
import DashboardLayout from "../dashboard/DashboardLayout";

const TrashWrapper: FC = () => {
	const [pages, setPages] = useState<Page[]>(() => listTrashedPages());

	useEffect(() => {
		const onUpdate = () => setPages(listTrashedPages());
		window.addEventListener(pagesEvents.eventName, onUpdate);
		return () => window.removeEventListener(pagesEvents.eventName, onUpdate);
	}, []);

	const handleRestore = (id: string) => {
		restorePage(id);
		toast.success("Page restored");
	};

	const handleDelete = (id: string) => {
		deletePagePermanent(id);
		toast.success("Page deleted permanently");
	};

	return (
		<DashboardLayout>
			<header className="mb-6">
				<h1 className="text-2xl font-semibold flex items-center gap-2">
					<Trash2 className="h-5 w-5 text-muted-foreground" /> Trash
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Restore pages or delete them forever.
				</p>
			</header>

			<section className="animate-fade-in grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Pages</CardTitle>
					</CardHeader>
					<CardContent>
						{pages.length === 0 ? (
							<p className="text-sm text-muted-foreground">Nothing in trash.</p>
						) : (
							<ul className="space-y-2">
								{pages.map((p) => (
									<li
										key={p.id}
										className="flex items-center justify-between rounded-md border px-3 py-2 bg-background/50"
									>
										<div className="min-w-0">
											<div
												className="font-medium truncate"
												title={p.title || "Untitled"}
											>
												{p.title || "Untitled"}
											</div>
											<div className="text-xs text-muted-foreground">
												Trashed{" "}
												{p.trashedAt
													? new Date(p.trashedAt).toLocaleString()
													: ""}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleRestore(p.id)}
											>
												<RotateCcw className="h-4 w-4 mr-2" /> Restore
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleDelete(p.id)}
											>
												<Trash2 className="h-4 w-4 mr-2" /> Delete forever
											</Button>
										</div>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				{/* Future: Tasks trash once tasks persistence is added */}
			</section>
		</DashboardLayout>
	);
};

export default TrashWrapper;
