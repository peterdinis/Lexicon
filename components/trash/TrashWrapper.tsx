"use client";

import { useState } from "react";
import { RotateCcw, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Page } from "@/types/applicationTypes";

interface TrashWrapperProps {
  initialPages: Page[];
}

export function TrashWrapper({ initialPages }: TrashWrapperProps) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const router = useRouter();

  const restorePage = async (id: string) => {
    try {
      const response = await fetch(`/api/pages/${id}/restore`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to restore page");

      setPages(pages.filter((p) => p.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error restoring page:", error);
    }
  };

  const permanentlyDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this page? This action cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch("/api/trash", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete page");

      setPages(pages.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  return (
    <div className="space-y-4">
      {pages.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Trash2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div
              key={page.id}
              className="group flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-medium">{page.title}</h3>
                {page.deleted_at && (
                  <p className="text-xs text-muted-foreground">
                    Deleted{" "}
                    {format(
                      new Date(page.deleted_at),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restorePage(page.id)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => permanentlyDelete(page.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Forever
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
