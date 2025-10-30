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
import { ImageIcon, X, Search, Loader2 } from "lucide-react";
import Image from "next/image";

interface CoverImageSelectorProps {
  value?: string | null;
  onChange: (url: string) => void;
}

const IMAGE_CATEGORIES = {
  nature: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&h=400&fit=crop",
  ],
  abstract: [
    "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=1200&h=400&fit=crop",
  ],
  technology: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=400&fit=crop",
  ],
  gradient: [
    "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1200&h=400&fit=crop",
    "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=1200&h=400&fit=crop",
  ],
};

const ALL_IMAGES = Object.values(IMAGE_CATEGORIES).flat();

type ImageCategory = keyof typeof IMAGE_CATEGORIES;

export function CoverImageSelector({
  value,
  onChange,
}: CoverImageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ImageCategory>("nature");
  const [isLoading, setIsLoading] = useState(false);

  const filteredImages = searchQuery
    ? ALL_IMAGES.filter((url) =>
        url.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : IMAGE_CATEGORIES[selectedCategory];

  const handleSelectImage = (url: string) => {
    onChange(url);
    setOpen(false);
  };

  const handleCustomUrl = async () => {
    if (!customUrl.trim()) return;

    setIsLoading(true);
    try {
      // Validácia URL
      new URL(customUrl.trim());

      // Test načítania obrázka
      await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = customUrl.trim();
      });

      onChange(customUrl.trim());
      setCustomUrl("");
      setOpen(false);
    } catch (error) {
      alert("Please enter a valid image URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setOpen(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCustomUrl(text);
    } catch (error) {
      console.error("Failed to read clipboard");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
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

            <TabsContent value="gallery" className="p-0">
              {/* Vyhľadávanie */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Kategórie (len ak nie je vyhľadávanie) */}
              {!searchQuery && (
                <div className="p-4 border-b">
                  <Tabs
                    value={selectedCategory}
                    onValueChange={(value) =>
                      setSelectedCategory(value as ImageCategory)
                    }
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-4">
                      {Object.keys(IMAGE_CATEGORIES).map((category) => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="text-xs capitalize"
                        >
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Galéria obrázkov */}
              <div className="p-4 max-h-80 overflow-y-auto">
                {filteredImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredImages.map((url, index) => (
                      <button
                        key={`${selectedCategory}-${index}`}
                        type="button"
                        onClick={() => handleSelectImage(url)}
                        className="relative aspect-video overflow-hidden rounded-md border hover:border-primary transition-colors group"
                      >
                        <div className="relative w-full h-full">
                          <Image
                            fill
                            src={url}
                            alt={`Cover ${index + 1}`}
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="mx-auto h-8 w-8 mb-2" />
                    <p>No images found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
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
                    <Button
                      variant="outline"
                      onClick={handlePaste}
                      type="button"
                    >
                      Paste
                    </Button>
                  </div>
                  <Button
                    onClick={handleCustomUrl}
                    className="w-full"
                    disabled={isLoading || !customUrl.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Add cover"
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Supported formats: JPG, PNG, WebP</p>
                  <p>Recommended size: 1200×400px</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>

      {value && (
        <Button variant="outline" size="sm" onClick={handleRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
