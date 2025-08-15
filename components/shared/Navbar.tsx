import Link from "next/link";
import type { FC } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "./ModeToggle";

const Navbar: FC = () => {
	return (
		<header className="container mx-auto py-8 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<div className="h-8 w-8 rounded-md border border-border grid place-items-center text-foreground font-bold">
					L
				</div>
				<span className="font-semibold">Lexicon</span>
			</div>
			<nav className="flex items-center gap-3">
				<Link href="/auth">
					<Button variant="outline">Sign in</Button>
				</Link>
				<ModeToggle />
			</nav>
		</header>
	);
};

export default Navbar;
