"use client";

import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import NewTemplateItem from "./NewTemplateItem";

interface TemplateDialogProps {
  children?: React.ReactNode; // ak chceš použiť vlastný trigger
}

const TemplateDialog: FC<TemplateDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button onClick={() => setOpen(true)}>New Template</Button>
        )}
      </DialogTrigger>
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
