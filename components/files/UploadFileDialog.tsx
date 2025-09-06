"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";

type UploadDialogProps = {
  uploadDialogOpen: boolean;
  setUploadDialogOpen: (uploadDialogOpen: boolean) => void;
};

const UploadDialog: FC<UploadDialogProps> = ({
  uploadDialogOpen,
  setUploadDialogOpen,
}: UploadDialogProps) => {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        TODO
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
