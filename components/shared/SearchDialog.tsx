"use client";

import { useLazyQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SEARCH_QUERY } from "@/graphql/queries/searchQueries";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

export default function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
	const [query, setQuery] = useState("");
	const [search, { data, loading }] = useLazyQuery(SEARCH_QUERY, { fetchPolicy: "no-cache" });

	useEffect(() => {
		if (query.trim().length > 1) {
			const timeout = setTimeout(() => {
				search({ variables: { query } });
			}, 300);
			return () => clearTimeout(timeout);
		}
	}, [query, search]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.2 }}
					className="bg-background"
				>
					<DialogHeader className="p-4 border-b">
						<DialogTitle>Search</DialogTitle>
						<DialogDescription>
							Find pages, workspaces, tasks, and more
						</DialogDescription>
					</DialogHeader>
					<div className="p-4 border-b">
						<Input
							placeholder="Type to search..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							autoFocus
						/>
					</div>
					<ScrollArea className="max-h-[400px]">
						<div className="p-4 space-y-4">
							{loading && (
								<div className="flex justify-center py-6">
									<Loader2 className="h-5 w-5 animate-spin" />
								</div>
							)}

							{!loading && data && (
								<>
									{["users", "pages", "workspaces", "tasks", "events"].map((type) => {
										const results = data.search[type];
										if (!results?.length) return null;
										return (
											<div key={type}>
												<h3 className="font-semibold capitalize mb-2">{type}</h3>
												<ul className="space-y-1">
													{results.map((item: any) => (
														<li key={item.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
															{item.name || item.title} {item.email && `(${item.email})`}
														</li>
													))}
												</ul>
											</div>
										);
									})}
								</>
							)}
						</div>
					</ScrollArea>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}