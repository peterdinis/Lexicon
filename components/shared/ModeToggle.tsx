"us client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative overflow-hidden"
        >
          <AnimatePresence initial={false}>
            {theme === "dark" ? (
              <motion.div
                key="moon"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { scale: 0, rotate: 90, opacity: 0 },
                  visible: { scale: 1, rotate: 0, opacity: 1 },
                }}
                transition={{ duration: 0.3 }}
                className="absolute h-[1.2rem] w-[1.2rem]"
              >
                <Moon />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { scale: 0, rotate: 90, opacity: 0 },
                  visible: { scale: 1, rotate: 0, opacity: 1 },
                }}
                transition={{ duration: 0.3 }}
                className="h-[1.2rem] w-[1.2rem]"
              >
                <Sun />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="py-1">
        {["light", "dark", "system"].map((mode) => (
          <motion.div
            key={mode}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <DropdownMenuItem onClick={() => setTheme(mode)}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </DropdownMenuItem>
          </motion.div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
