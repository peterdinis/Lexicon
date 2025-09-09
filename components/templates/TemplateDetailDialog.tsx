"use client";

import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TemplateDetailDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  templateId: Id<"templates"> | null;
}

const TemplateDetailDialog: FC<TemplateDetailDialogProps> = ({
  open,
  setOpen,
  templateId,
}) => {
  // ✅ Use getById instead of listByUser
  const template = useQuery(
    api.templates.getById,
    templateId ? { id: templateId } : "skip",
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Template Details</DialogTitle>
        </DialogHeader>
        {templateId ? (
          template ? (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">{template.name}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {template.content}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">No template selected.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDetailDialog;
