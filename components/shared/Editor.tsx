"use client";

import { type FC, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import "quill-emoji/dist/quill-emoji.css";
import { EmojiBlot, ToolbarEmoji } from "quill-emoji";
import "quill-mention/dist/quill.mention.css";
import QuillBetterTable from "quill-better-table";
import QuillMention from "quill-mention";

// --- Register custom modules ---
Quill.register("modules/emoji", ToolbarEmoji);
Quill.register({ "formats/emoji": EmojiBlot });
Quill.register("modules/mention", QuillMention);
Quill.register({ "modules/better-table": QuillBetterTable });

// --- Divider embed (block-level) ---
const BlockEmbed = Quill.import("blots/block/embed");
class DividerBlot extends BlockEmbed {
	static blotName = "divider";
	static tagName = "hr";
}
Quill.register(DividerBlot);

const Editor: FC = () => {
	const [value, setValue] = useState<string>("");
	const quillRef = useRef<ReactQuill | null>(null);

	// --- Slash command state ---
	const [showSlashMenu, setShowSlashMenu] = useState(false);
	const [slashPosition, setSlashPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);

	const modules = {
		toolbar: {
			container: [
				[{ font: [] }, { size: [] }],
				["bold", "italic", "underline", "strike"],
				[{ color: [] }, { background: [] }],
				[{ script: "sub" }, { script: "super" }],
				[{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
				[
					{ list: "ordered" },
					{ list: "bullet" },
					{ indent: "-1" },
					{ indent: "+1" },
				],
				["direction", { align: [] }],
				["link", "image", "video", "formula"],
				["clean"],
				["emoji"],
			],
			handlers: {
				image: () => handleFileUpload("image"),
				video: () => handleFileUpload("video"),
			},
		},
		clipboard: { matchVisual: false },
		history: { delay: 1000, maxStack: 50, userOnly: true },
		syntax: {
			highlight: (text: string) => hljs.highlightAuto(text).value,
		},
		mention: {
			allowedChars: /^[A-Za-z\s]*$/,
			source: (
				searchTerm: string,
				renderList: (matches: any[], term: string) => void,
			) => {
				const users = [
					{ id: 1, value: "Alice" },
					{ id: 2, value: "Bob" },
				];
				const matches = users.filter((u) =>
					u.value.toLowerCase().includes(searchTerm.toLowerCase()),
				);
				renderList(matches, searchTerm);
			},
		},
		"better-table": true,
	};

	const formats = [
		"font",
		"size",
		"bold",
		"italic",
		"underline",
		"strike",
		"color",
		"background",
		"script",
		"header",
		"blockquote",
		"code-block",
		"list",
		"bullet",
		"indent",
		"direction",
		"align",
		"link",
		"image",
		"video",
		"formula",
		"emoji",
		"mention",
		"divider",
	];

	// --- File upload handler ---
	const handleFileUpload = (type: "image" | "video") => {
		const input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", type + "/*");
		input.click();

		input.onchange = () => {
			if (input.files && quillRef.current) {
				const file = input.files[0];
				const reader = new FileReader();
				reader.onload = () => {
					const quill = quillRef.current?.getEditor();
					const range = quill!.getSelection();
					const index = range?.index ?? 0;

					// Insert embed
					quill!.insertEmbed(index, type, reader.result);

					// Move cursor **after the embed**
					quill!.setSelection(index + 1, 0); // <-- pass length = 0
				};
				reader.readAsDataURL(file);
			}
		};
	};

	// --- Slash command detection ---
	const handleTextChange = (
		content: string,
		delta: any,
		source: "user" | "api" | "silent",
		editor: {
			getText: (index: number, length: number) => string;
			getSelection: () => { index: number; length: number } | null;
		},
	) => {
		setValue(content);
		if (source === "user") {
			const range = editor.getSelection();
			if (!range) return;
			const textBefore = editor.getText(0, range.index);
			const lastChar = textBefore.slice(-1);
			if (lastChar === "/") {
				const bounds = quillRef.current?.getEditor().getBounds(range.index);
				setSlashPosition({
					top: bounds!.top + bounds!.height,
					left: bounds!.left,
				});
				setShowSlashMenu(true);
			} else {
				setShowSlashMenu(false);
			}
		}
	};

	return (
		<div style={{ position: "relative" }}>
			<ReactQuill
				ref={quillRef}
				value={value}
				onChange={handleTextChange}
				modules={modules}
				formats={formats}
				theme="snow"
				placeholder="Write something advanced..."
			/>
			{showSlashMenu && slashPosition && (
				<div
					style={{
						position: "absolute",
						top: slashPosition.top,
						left: slashPosition.left,
						background: "white",
						border: "1px solid #ccc",
						borderRadius: 4,
						zIndex: 10,
					}}
				>
					<div
						style={{ padding: 4, cursor: "pointer" }}
						onClick={() => {
							const quill = quillRef.current?.getEditor();
							const range = quill!.getSelection(true);
							quill!.insertText(range.index, "\n", "user");
							quill!.insertEmbed(range.index + 1, "divider", true);
							setShowSlashMenu(false);
						}}
					>
						Divider
					</div>
					<div
						style={{ padding: 4, cursor: "pointer" }}
						onClick={() => {
							const quill = quillRef.current?.getEditor();
							quill!.format("header", 1);
							setShowSlashMenu(false);
						}}
					>
						Heading 1
					</div>
					<div
						style={{ padding: 4, cursor: "pointer" }}
						onClick={() => {
							const quill = quillRef.current?.getEditor();
							quill!.format("code-block", true);
							setShowSlashMenu(false);
						}}
					>
						Code Block
					</div>
				</div>
			)}
		</div>
	);
};

export default Editor;
