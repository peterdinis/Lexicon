"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useMutation, useQuery } from "@apollo/client";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CREATE_PAGE } from "@/graphql/mutations/pages/pagesMutations";
import { ME_QUERY } from "@/graphql/queries/auth/authQueries";
import { GET_CURRENT_WORKSPACE } from "@/graphql/queries/workspaces/workspaceQueries";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "next-themes";

const Editor: FC = () => {
	const editor = useCreateBlockNote();
	const [title, setTitle] = useState("");
	const [emoji, setEmoji] = useState("📝");
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const {theme} = useTheme()
	const router = useRouter();

	const { data: meData } = useQuery(ME_QUERY);

	const { data: wsData } = useQuery(GET_CURRENT_WORKSPACE, {
		skip: !meData?.me?.id,
		variables: { userId: meData?.me?.id },
	});

	const [createPage, { loading: saving }] = useMutation(CREATE_PAGE, {
		onCompleted: (data) => {
			console.log("Page saved:", data.createPage);
			setLastSaved(new Date());
			router.push("/dashboard");
		},
		onError: (err) => {
			console.error("Error saving page:", err);
		},
	});

	const savePage = useCallback(async () => {
		if (!editor || !title.trim()) return;
		if (!meData?.me?.id || !wsData?.currentWorkspace?.id) {
			console.error("Missing user or workspace");
			return;
		}

		const content = editor.document;

		try {
			await createPage({
				variables: {
					input: {
						title,
						content: JSON.stringify(content),
						workspaceId: wsData.currentWorkspace.id,
						ownerId: meData.me.id,
						emoji,
					},
				},
			});
			setLastSaved(new Date());
		} catch (err) {
			console.error("Failed to save page:", err);
		}
	}, [title, editor, meData, wsData, createPage, emoji]);

	return (
		<div className="max-w-4xl mx-auto px-8 py-12">

			<Link
				href="/dashboard"
				className="flex items-center gap-2 text-primary hover:underline"
			>
				<ArrowLeft className="h-4 w-4" />
				<span>Go Back</span>
			</Link>
			<div className="flex items-center gap-3 mt-5 mb-8">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className="w-14 h-14 text-3xl flex items-center justify-center"
						>
							{emoji}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="p-0">
						<Picker
							data={data}
							onEmojiSelect={(e: any) => setEmoji(e.native)}
						/>
					</PopoverContent>
				</Popover>

				<Input
					placeholder="Untitled"
					className={cn(
						"text-4xl font-bold border-0 shadow-none flex-1",
						"focus-visible:ring-0 focus-visible:outline-none",
						"placeholder:text-muted-foreground",
					)}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
			</div>

			{/* Editor */}
			<div className="rounded-2xl border shadow-sm p-1">
				{editor && (
					<BlockNoteView
						editor={editor}
						theme={theme === "dark" ? "dark" : "light"}
						shadCNComponents={{}}
						className="min-h-[70vh] text-lg"
					/>
				)}
			</div>

			{/* Save status + button */}
			<div className="flex items-center justify-between mt-4">
				<div className="text-sm text-muted-foreground">
					{saving ? (
						<Loader2 className="animate-spin w-5 h-5" />
					) : lastSaved ? (
						`Last saved at ${lastSaved.toLocaleTimeString()}`
					) : (
						"Not saved yet"
					)}
				</div>
				<Button onClick={savePage}>
					{saving ? <Loader2 className="animate-spin w-5 h-5" /> : "Save"}
				</Button>
			</div>
		</div>
	);
};

export default Editor;
