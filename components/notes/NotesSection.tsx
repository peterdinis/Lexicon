import { type FC, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";

const NotesSection: FC = () => {
	const [note, setNote] = useState("");
	return (
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
	);
};

export default NotesSection;
