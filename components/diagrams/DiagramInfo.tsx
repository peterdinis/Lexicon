"use client";

import { FC, useEffect, useState, useCallback, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  getDiagramAction,
  updateDiagramAction,
  deleteDiagramAction,
} from "@/actions/diagramActions";
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
import { v4 as uuidv4 } from "uuid";

// --------------------
// Custom Node Label
// --------------------
const NodeLabel = ({
  node,
  onChange,
}: {
  node: Node;
  onChange: (val: string) => void;
}) => {
  const [label, setLabel] = useState(node.data.label);

  const handleBlur = () => onChange(label as unknown as string);

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className="p-1"
      onBlur={handleBlur}
      onInput={(e) => setLabel(e.currentTarget.textContent || "")}
      style={{ minWidth: 60, textAlign: "center" }}
    >
      {label as unknown as ReactNode}
    </div>
  );
};

const DiagramInfo: FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [diagram, setDiagram] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

        const parsedNodes =
          typeof data.nodes === "string"
            ? JSON.parse(data.nodes)
            : data.nodes || [];
        const parsedEdges =
          typeof data.edges === "string"
            ? JSON.parse(data.edges)
            : data.edges || [];

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
      if (result?.data) setDiagram(result.data);
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

  // ----------------------
  // ReactFlow handlers
  // ----------------------
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  // ----------------------
  // Node operations
  // ----------------------
  const addNode = (type: "text" | "image" | "custom") => {
    const newNode: Node = {
      id: uuidv4(),
      position: { x: 250, y: 250 },
      data: {
        label:
          type === "text"
            ? "Text Node"
            : type === "image"
              ? "Image Node"
              : "Custom Node",
      },
      style: {
        background: type === "custom" ? "#ffd700" : "#fff",
        border: "1px solid #777",
        borderRadius: type === "custom" ? 8 : 4,
        padding: 5,
        minWidth: 60,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  };

  const duplicateSelected = () => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const newNodes = selectedNodes.map((n) => ({
      ...n,
      id: uuidv4(),
      position: { x: n.position.x + 50, y: n.position.y + 50 },
    }));
    setNodes((nds) => [...nds, ...newNodes]);
  };

  const updateNodeLabel = (nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
      ),
    );
  };

  if (loading) return <p>Loading diagram...</p>;
  if (!diagram) return <p>Diagram not found.</p>;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Diagram Detail</h1>
        <Button variant="destructive" onClick={deleteDiagram}>
          Delete Diagram
        </Button>
      </div>

      {/* Metadata */}
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

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveDiagram} disabled={saving}>
            Save Changes
          </Button>
          <Button onClick={() => addNode("text")}>Add Text Node</Button>
          <Button onClick={() => addNode("image")}>Add Image Node</Button>
          <Button onClick={() => addNode("custom")}>Add Custom Node</Button>
          <Button onClick={deleteSelected} variant="destructive">
            Delete Selected
          </Button>
          <Button onClick={duplicateSelected}>Duplicate Selected</Button>
        </div>
      </div>

      {/* ReactFlow */}
      <div className="mt-8 h-[600px] border rounded">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes.map((n) => ({
              ...n,
              data: {
                ...n.data,
                label: (
                  <NodeLabel
                    node={n}
                    onChange={(val) => updateNodeLabel(n.id, val)}
                  />
                ),
              },
            }))}
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
