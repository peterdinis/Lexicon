"use client";

import { FC, useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type UploadDialogProps = {
  uploadDialogOpen: boolean;
  setUploadDialogOpen: (uploadDialogOpen: boolean) => void;
};

const UploadDialog: FC<UploadDialogProps> = ({
  uploadDialogOpen,
  setUploadDialogOpen,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const saveFileMetadata = useMutation(api.uploads.saveFileMetadata);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!response.ok) {
        toast({
          title: "File was not uploaded",
        });
        return;
      }

      const { storageId } = await response.json();

      await saveFileMetadata({
        storageId,
        name: selectedFile.name,
        size: selectedFile.size,
        contentType: selectedFile.type,
      });

      toast({
        title: "File was uploaded",
      });

      setSelectedFile(null);
      setUploadDialogOpen(false);
    } catch (error) {
      toast({
        title: "Upload failed",
      });
    }
  };

  return (
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-6 overflow-hidden flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <div className="flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-accent/10 transition-colors relative">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute opacity-0 w-full h-full cursor-pointer"
          />
          <p className="text-muted-foreground">
            Drag & drop files here or click to select
          </p>
        </div>

        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <p>Selected file: {selectedFile.name}</p>
            <p>Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
          </motion.div>
        )}

        <DialogFooter className="flex justify-end gap-2">
          <button
            onClick={() => setUploadDialogOpen(false)}
            className="px-4 py-2 rounded border hover:bg-accent/10"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Upload
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
