"use client";

import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewTemplateItem from "./NewTemplateItem";

interface TemplateDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TemplateDialog: FC<TemplateDialogProps> = ({ open, setOpen }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>
        <NewTemplateItem onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
