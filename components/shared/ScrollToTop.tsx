"use client"

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ChevronUp } from "lucide-react";

type Props = {
  threshold?: number;
  bottom?: string; // tailwind spacing token (without 'bottom-') e.g. '6' -> bottom-6
  right?: string; // same as above for right-<value>
  className?: string;
};

export default function ScrollToTop({
  threshold = 300,
  bottom = "6",
  right = "6",
  className = "",
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // set initial state in case user is already scrolled
    setVisible(window.scrollY > threshold);

    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Compose tailwind position classes dynamically
  const positionClasses = `fixed right-${right} bottom-${bottom} z-50`;

  return (
    <div aria-hidden={!visible} className={`${positionClasses} ${className}`}>
      <div
        className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleClick}
              variant="secondary"
              className="rounded-full p-2 h-10 w-10 shadow-lg"
              aria-label="Scroll to top"
            >
              <ChevronUp size={18} aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Back to top</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
