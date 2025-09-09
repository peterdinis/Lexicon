"use client";

import { FC, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { BookTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface TemplatesItemProps {
  name: string;
  id: Id<"templates">;
  index: number;
  content: string;
}

const TemplatesItem: FC<TemplatesItemProps> = ({ name, content }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/60 cursor-pointer"
      >
        <BookTemplate className="w-4 h-4" />
        <span className="text-sm truncate">{name}</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Template Info</DialogTitle>
            <DialogDescription>
              Details for template: <strong>{name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p>{content}</p>
          </div>

          <DialogClose className="mt-4 btn btn-primary">Close</DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplatesItem;
