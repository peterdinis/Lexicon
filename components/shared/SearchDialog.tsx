"use client";

import { motion } from "framer-motion";
import { Ghost, Loader2 } from "lucide-react";
import { type Key, useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearch } from "@/hooks/shared/useSearch";

export default function SearchDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const [query, setQuery] = useState("");
	const [hasSearched, setHasSearched] = useState(false);

	const { runSearch, data, error, loading } = useSearch();

	useEffect(() => {
		if (query.trim().length > 1) {
			runSearch(query).then(() => setHasSearched(true));
		}
	}, [query, runSearch]);

	// 👉 reset input po zavretí
	useEffect(() => {
		if (!open) {
			setQuery("");
			setHasSearched(false);
		}
	}, [open]);

	const hasNoResults =
		hasSearched &&
		!loading &&
		data &&
		["users", "pages", "workspaces", "tasks", "events"].every(
			(type) => !data.search[type]?.length,
		);

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
							onChange={(e) => {
								setQuery(e.target.value);
								setHasSearched(false);
							}}
							autoFocus
						/>
					</div>
					<ScrollArea className="max-h-[400px]">
						<div className="p-4 space-y-4">
							{hasSearched && (
								<>
									{loading && (
										<div className="flex justify-center py-6">
											<Loader2 className="h-5 w-5 animate-spin" />
										</div>
									)}

									{error && (
										<div className="text-center py-6 text-sm text-red-500">
											Something went wrong: {error.message}
										</div>
									)}

									{hasNoResults && (
										<div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
											<Ghost className="animate-bounce w-8 h-8" />
											No results found for “{query}”
										</div>
									)}

									{!loading &&
										data &&
										!hasNoResults &&
										["users", "pages", "workspaces", "tasks", "events"].map(
											(type) => {
												const results = data.search[type];
												if (!results?.length) return null;
												return (
													<div key={type}>
														<h3 className="font-semibold capitalize mb-2">
															{type}
														</h3>
														<ul className="space-y-1">
															{results.map(
																(item: {
																	id: Key;
																	name?: string;
																	title?: string;
																	email?: string;
																}) => (
																	<li
																		key={item.id}
																		className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
																	>
																		{item.name || item.title}{" "}
																		{item.email && `(${item.email})`}
																	</li>
																),
															)}
														</ul>
													</div>
												);
											},
										)}
								</>
							)}
						</div>
					</ScrollArea>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
