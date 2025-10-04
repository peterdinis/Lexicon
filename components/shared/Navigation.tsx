"use client";

import { useScrollTop } from "@/hooks/use-scroll-to-top";
import { cn } from "@/lib/utils";
import { FC, useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

const Navigation: FC = () => {
  const scrolled = useScrollTop();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-[#1f1f1f] fixed top-0 flex items-center w-full px-6 py-4",
        scrolled && "shadow-sm border-b",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-800 text-white font-bold text-lg">
          L
        </span>
        <span className="text-2xl font-extrabold tracking-tight text-gray-800 dark:text-white">
          exicon
        </span>
      </div>

      {/* Tlačidlá / Hamburger */}
      <div className="md:ml-auto flex items-center">
        {/* Desktop tlačidlá */}
        <div className="hidden md:flex gap-x-2">
          TODO
          <ModeToggle />
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-background dark:bg-[#1f1f1f] flex flex-col items-center gap-2 py-4 shadow-md md:hidden">
          <Button>Login</Button>
          <Button>New Account</Button>
        </div>
      )}
    </div>
  );
};

export default Navigation;
