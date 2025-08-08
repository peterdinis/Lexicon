import { FC } from "react";
import Link from "next/link";
import { Button } from "../ui/button";

const HeroWrapper: FC = () => {
    return (
        <div className="min-h-screen bg-background">
            <header className="container mx-auto py-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md border border-border grid place-items-center text-foreground font-bold">L</div>
                    <span className="font-semibold">Lexicon</span>
                </div>
                <nav className="flex items-center gap-3">
                    <Link href="/auth"><Button variant="outline">Sign in</Button></Link>
                </nav>
            </header>
            <main className="container mx-auto px-6 py-14">
                <section className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">Organize your ideas with a Notion-like flow</h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">Clean, fast, and focused. Pages, notes, and tasks in one calm space using Notion-inspired colors and layout.</p>
                    <div className="flex items-center justify-center gap-3">
                        <Link href="/auth"><Button variant="default">Get Started</Button></Link>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default HeroWrapper