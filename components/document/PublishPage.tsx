"use client";

import { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublishPageProps {
  onSaveDraft: () => void;
}

const PublishPage: FC<PublishPageProps> = ({ onSaveDraft }) => {
  const { toast } = useToast();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Publish Page</span>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onSaveDraft}>Save Draft</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            toast({
              title: "Publishing page",
              duration: 2000,
              className: "bg-green-800 text-white font-bold text-xl",
            });
          }}
        >
          Publish Now
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => alert("Schedule publishing")}>
          Schedule
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PublishPage;
