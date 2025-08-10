import Link from "next/link";
import type { FC } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";

const HeroWrapper: FC = () => {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main className="container mx-auto px-6 py-14">
				<section className="mx-auto max-w-3xl text-center">
					<h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
						Organize your ideas with a Notion-like flow
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground mb-8">
						Clean, fast, and focused. Pages, notes, and tasks in one calm space
						using Notion-inspired colors and layout.
					</p>
					<div className="flex items-center justify-center gap-3">
						<Link href="/auth">
							<Button variant="default">Get Started</Button>
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
};

export default HeroWrapper;
