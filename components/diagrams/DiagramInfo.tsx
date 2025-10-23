"use client";

import { FC, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getDiagramAction, updateDiagramAction, deleteDiagramAction } from "@/actions/diagramActions";
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const DiagramInfo: FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [diagram, setDiagram] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // ← PRIDANÉ
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // ----------------------
  // Load diagram
  // ----------------------
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getDiagramAction({ id })
      .then((result) => {
        if (!result?.data) return;

        const data = result.data;

        setDiagram(data);
        setTitle(data.title);
        setDescription(data.description || "");

        // nodes/edges sa môžu ukladať ako stringy → parsujeme
        const parsedNodes = typeof data.nodes === "string" ? JSON.parse(data.nodes) : data.nodes || [];
        const parsedEdges = typeof data.edges === "string" ? JSON.parse(data.edges) : data.edges || [];

        setNodes(parsedNodes);
        setEdges(parsedEdges);
      })
      .catch((err) => console.error("Failed to load diagram:", err))
      .finally(() => setLoading(false));
  }, [id, setNodes, setEdges]);

  // ----------------------
  // Save diagram
  // ----------------------
  const saveDiagram = async () => {
    if (!diagram) return;

    setSaving(true);
    try {
      const result = await updateDiagramAction({
        id: diagram.id,
        title,
        description,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
      });
      
      if (result?.data) {
        setDiagram(result.data);
      }
    } catch (err) {
      console.error("Failed to update diagram:", err);
    } finally {
      setSaving(false);
    }
  };

  // ----------------------
  // Delete diagram
  // ----------------------
  const deleteDiagram = async () => {
    if (!diagram) return;
    if (!confirm("Are you sure you want to delete this diagram?")) return;

    try {
      await deleteDiagramAction({ id: diagram.id });
      router.push("/diagrams");
    } catch (err) {
      console.error("Failed to delete diagram:", err);
    }
  };

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  if (loading) return <p>Loading diagram...</p>;
  if (!diagram) return <p>Diagram not found.</p>;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Diagram Detail</h1>
        <Button variant="destructive" onClick={deleteDiagram}>
          Delete Diagram
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
        </div>

        <Button onClick={saveDiagram} disabled={saving}>
          Save Changes
        </Button>
      </div>

      <div className="mt-8 h-[500px] border rounded">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default DiagramInfo;