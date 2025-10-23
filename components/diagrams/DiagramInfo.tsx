"use client"

import { FC, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getDiagramAction, updateDiagramAction, deleteDiagramAction } from "@/actions/diagramActions";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const DiagramInfo: FC = () => {
  const params = useParams();
  const router = useRouter();

  console.log("Params:", params);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [diagram, setDiagram] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getDiagramAction({ id })
      .then((result) => {
        if (!result.data) return;
        setDiagram(result.data);
        setTitle(result.data.title);
        setDescription(result.data.description || "");
      })
      .catch((err) => console.error("Failed to load diagram:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const saveDiagram = async () => {
    if (!diagram) return;

    setSaving(true);
    try {
      const updated = await updateDiagramAction({
        id: diagram.id,
        title,
        description,
        nodes: diagram.nodes,
        edges: diagram.edges,
      });
      setDiagram(updated);
    } catch (err) {
      console.error("Failed to update diagram:", err);
    } finally {
      setSaving(false);
    }
  };

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
        <ReactFlow nodes={diagram.nodes} edges={diagram.edges}>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DiagramInfo;
