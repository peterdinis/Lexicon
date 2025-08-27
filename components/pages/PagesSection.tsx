"use client";

import { FC, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PagesSectionProps {
  workspaceId: number;
  listeners?: any;
  attributes?: any;
}

const PagesSection: FC<PagesSectionProps> = ({ workspaceId, listeners, attributes }) => {
  const { pages, loading, error } = usePages(workspaceId);

  if (loading) return <Loader2 className="animate-spin w-8 h-8" />
  if (error) return <p>Error loading pages</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Pages</CardTitle>
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {pages.map((page: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: number) => (
              <motion.li
                key={page.id}
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <span>{page.title}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast(`Open ${page.title}`)}
                >
                  Open
                </Button>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PagesSection;
function usePages(workspaceId: number): { pages: any; loading: any; error: any; } {
  throw new Error("Function not implemented.");
}

