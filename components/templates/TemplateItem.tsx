"use client";

import { FC } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { BookTemplate } from "lucide-react";

interface TemplatesItemProps {
  name: string;
  id: Id<"templates">;
  index: number;
}

const TemplatesItem: FC<TemplatesItemProps> = ({ name }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/60 cursor-pointer">
      <BookTemplate className="w-4 h-4" />
      <span className="text-sm truncate">{name}</span>
    </div>
  );
};

export default TemplatesItem;
