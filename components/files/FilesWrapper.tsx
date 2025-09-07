"use client";

import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Download, ImageIcon, FileIcon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import prettyBytes from "pretty-bytes";
import { formatDistanceToNow } from "date-fns";

const FilesWrapper: FC = () => {
  const files = useQuery(api.uploads.getFiles);
  const deleteFile = useMutation(api.uploads.deleteFile);
  const { toast } = useToast();

  const handleDeleteFile = async (fileId: any, storageId: any, fileName: string) => {
    try {
      await deleteFile({ fileId, storageId });
      toast({
        title: "File deleted",
        description: `${fileName} has been successfully deleted.`,
        className: "bg-green-800 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the file.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 mb-2 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 mb-2 text-primary" />;
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Your Files</h2>
      
      <AnimatePresence>
        {files && files.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {files &&
              files.map((file) => (
                <motion.div
                  key={file.fileId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                  }}
                  className="relative bg-background border border-border rounded-lg p-4 flex flex-col hover:bg-accent/10 transition-colors"
                >
                  {/* File Icon */}
                  <div className="flex justify-center mb-3">
                    {getFileIcon(file.contentType)}
                  </div>

                  {/* File Name */}
                  <div className="text-sm font-medium mb-2 text-center truncate w-full" title={file.name}>
                    {file.name}
                  </div>

                  {/* File Details */}
                  <div className="text-xs text-muted-foreground text-center mb-3">
                    <div>{prettyBytes(file.size)}</div>
                    <div>{formatDistanceToNow(file.uploadedAt, { addSuffix: true })}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-2 mt-auto">
                    <button
                      onClick={() => handleDownload(file.url!, file.name)}
                      className="p-1 rounded-full hover:bg-primary/20 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4 text-primary" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteFile(file.fileId, file.id, file.name)}
                      className="p-1 rounded-full hover:bg-destructive/20 transition-colors"
                      title="Delete file"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilesWrapper;