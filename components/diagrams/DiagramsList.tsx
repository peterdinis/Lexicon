"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Diagram } from "@/types/applicationTypes";

interface DiagramListProps {
  initialDiagrams: Diagram[];
}

export function DiagramList({ initialDiagrams }: DiagramListProps) {
  const [diagrams, setDiagrams] = useState<Diagram[]>(initialDiagrams);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createDiagram = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diagrams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Diagram" }),
      });

      if (!response.ok) throw new Error("Failed to create diagram");

      const newDiagram = await response.json();
      setDiagrams([newDiagram, ...diagrams]);
      router.push(`/diagrams/${newDiagram.id}`);
    } catch (error) {
      console.error("Error creating diagram:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDiagram = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this diagram?")) return;

    try {
      const response = await fetch(`/api/diagrams/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete diagram");

      setDiagrams(diagrams.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting diagram:", error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button onClick={createDiagram} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          New Diagram
        </Button>
      </div>

      {diagrams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No diagrams yet. Create your first diagram!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {diagrams.map((diagram, index) => (
            <motion.div
              key={diagram.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => router.push(`/diagrams/${diagram.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">
                        {diagram.title}
                      </CardTitle>
                      {diagram.description && (
                        <CardDescription className="line-clamp-2">
                          {diagram.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => deleteDiagram(diagram.id, e)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {diagram.nodes?.length || 0} nodes •{" "}
                    {diagram.edges?.length || 0} edges
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Updated {new Date(diagram.updated_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
