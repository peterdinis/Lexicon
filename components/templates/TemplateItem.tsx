"use client";

import { FC } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface TemplatesItemProps {
  name: string;
  id: Id<"templates">;
  index: number;
}

const TemplatesItem: FC<TemplatesItemProps> = ({ name }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/60 cursor-pointer">
      <span className="text-sm truncate">{name}</span>
    </div>
  );
};

export default TemplatesItem;
