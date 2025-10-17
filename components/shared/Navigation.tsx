"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { ModeToggle } from "./ModeToggle";
import { Button } from "../ui/button";

const Navigation: FC = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Sparkles className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="text-xl font-bold">Lexicon</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <ModeToggle />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" className="bg-primary text-primary-foreground">
                Try for free
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
