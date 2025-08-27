"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

interface PagesSectionProps {
  listeners?: any;
  attributes?: any;
}

const PagesSection: FC<PagesSectionProps> = ({ listeners, attributes }) => {
  const pages = [
    { title: "Landing Page" },
    { title: "About Us Page" },
    { title: "Contact Page" },
  ];

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
            {pages.map((page, index) => (
              <motion.li
                key={page.title}
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
