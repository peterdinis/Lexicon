"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, FileText, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Diagram } from "@/types/applicationTypes";
import {
  createDiagramAction,
  deleteDiagramAction,
  getAllDiagramsAction,
} from "@/actions/diagramActions";
import { Spinner } from "../ui/spinner";

// Lokálny typ pre kompatibilitu s dátami z servera
interface ServerDiagram {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  nodes: unknown;
  edges: unknown;
  viewport: unknown;
  deleted_at: Date | null;
  in_trash: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DiagramListProps {
  initialDiagrams: ServerDiagram[];
}

export function DiagramList({ initialDiagrams }: DiagramListProps) {
  const [diagrams, setDiagrams] = useState<ServerDiagram[]>(initialDiagrams);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDiagrams(initialDiagrams);
  }, [initialDiagrams]);

  const refreshDiagrams = async () => {
    setRefreshing(true);
    try {
      const result = await getAllDiagramsAction();
      if (result?.data) {
        setDiagrams(result.data);
      }
    } catch (error) {
      console.error("Error refreshing diagrams:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const createDiagram = async () => {
    setLoading(true);
    try {
      const result = await createDiagramAction({
        title: "Untitled Diagram",
        description: "",
        nodes: [],
        edges: [],
      });

      if (result?.data) {
        const newDiagram = result.data;
        await refreshDiagrams();
        router.push(`/diagrams/${newDiagram.id}`);
      } else {
        console.error("No data returned from createDiagramAction", result);
        await refreshDiagrams();
      }
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
      const result = await deleteDiagramAction({ id });
      if (result?.data) {
        setDiagrams(diagrams.filter((d) => d.id !== id));
      } else {
        console.error("Failed to delete diagram");
        await refreshDiagrams();
      }
    } catch (error) {
      console.error("Error deleting diagram:", error);
      await refreshDiagrams();
    }
  };

  const getNodeCount = (diagram: ServerDiagram): number => {
    try {
      if (Array.isArray(diagram.nodes)) {
        return diagram.nodes.length;
      } else if (typeof diagram.nodes === "string") {
        const parsed = JSON.parse(diagram.nodes || "[]");
        return Array.isArray(parsed) ? parsed.length : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const getEdgeCount = (diagram: ServerDiagram): number => {
    try {
      if (Array.isArray(diagram.edges)) {
        return diagram.edges.length;
      } else if (typeof diagram.edges === "string") {
        const parsed = JSON.parse(diagram.edges || "[]");
        return Array.isArray(parsed) ? parsed.length : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown date";
    }
  };

  return (
    <Suspense fallback={<Spinner />}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Diagrams</h1>
            <p className="text-muted-foreground">
              Create and manage your flow diagrams
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refreshDiagrams}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={createDiagram} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              New Diagram
            </Button>
          </div>
        </div>

        {diagrams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No diagrams yet. Create your first diagram!
              </p>
              <Button onClick={createDiagram} disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Create Diagram
              </Button>
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-primary/20"
                  onClick={() => router.push(`/diagrams/${diagram.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-1 text-lg">
                          {diagram.title || "Untitled Diagram"}
                        </CardTitle>
                        {diagram.description && (
                          <CardDescription className="line-clamp-2 mt-1">
                            {diagram.description}
                          </CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => deleteDiagram(diagram.id, e)}
                        className="h-8 w-8 shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        {getNodeCount(diagram)} nodes • {getEdgeCount(diagram)}{" "}
                        edges
                      </span>
                      <span>
                        Updated{" "}
                        {formatDate(diagram.updated_at as unknown as string)}
                      </span>
                    </div>
                    {diagram.created_at !== diagram.updated_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Created{" "}
                        {formatDate(diagram.created_at as unknown as string)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Suspense>
  );
}
