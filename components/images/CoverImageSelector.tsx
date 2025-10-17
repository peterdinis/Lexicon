"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ImageIcon, X } from "lucide-react";

interface CoverImageSelectorProps {
  value?: string;
  onChange: (url: string | null) => void;
}

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1200&h=400&fit=crop",
];

export function CoverImageSelector({
  value,
  onChange,
}: CoverImageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const handleSelectImage = (url: string) => {
    onChange(url);
    setOpen(false);
  };

  const handleCustomUrl = () => {
    if (customUrl) {
      onChange(customUrl);
      setCustomUrl("");
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <ImageIcon className="mr-2 h-4 w-4" />
            {value ? "Change cover" : "Add cover"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="gallery" className="flex-1">
                Gallery
              </TabsTrigger>
              <TabsTrigger value="url" className="flex-1">
                URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="gallery" className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {UNSPLASH_IMAGES.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectImage(url)}
                    className="relative aspect-video overflow-hidden rounded-md border hover:border-primary transition-colors"
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Cover ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="url" className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Paste image URL..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCustomUrl();
                      }
                    }}
                  />
                  <Button onClick={handleCustomUrl} className="w-full">
                    Add cover
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      {value && (
        <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
