"use client";

import { FC, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  ConnectionMode,
  Panel,
  useReactFlow,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  OnConnect,
  NodeChange,
  EdgeChange,
  XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Trash2,
  Copy,
  Save,
  Download,
  Upload,
  Type,
  Square,
  Circle,
  Diamond,
  Database,
  Cloud,
  Server,
  Users,
  Workflow,
  ArrowRight,
  Zap,
  Brain,
  Network,
  GitBranch,
  MessageSquare,
  Cpu,
  Shield,
  Layout,
  GitFork,
} from "lucide-react";

// --------------------
// Type Definitions
// --------------------
interface DiagramData {
  id: string;
  title: string;
  description?: string;
  nodes: string;
  edges: string;
}

interface TextNodeData {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}

interface ShapeNodeData {
  label: string;
  shape: "rectangle" | "circle" | "diamond";
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: number;
}

interface IconNodeData {
  label: string;
  iconType: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
}

interface CustomEdgeData {
  label?: string;
  color?: string;
  width?: number;
  style?: "solid" | "dashed" | "dotted";
  textColor?: string;
}

type CustomNode = Node<TextNodeData | ShapeNodeData | IconNodeData>;
type CustomEdge = Edge<CustomEdgeData>;

// --------------------
// Custom Node Types
// --------------------
const TextNode: FC<{ data: TextNodeData; selected?: boolean }> = ({
  data,
  selected,
}) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[120px] text-center transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-300 bg-white hover:shadow-sm"
      }`}
      style={{
        backgroundColor: data.backgroundColor || "#ffffff",
        color: data.textColor || "#000000",
        borderColor: selected ? "#3b82f6" : data.borderColor || "#d1d5db",
        fontSize: data.fontSize || 14,
        fontFamily: data.fontFamily || "inherit",
        fontWeight: data.fontWeight || "normal",
      }}
    >
      {data.label}
    </div>
  );
};

const ShapeNode: FC<{ data: ShapeNodeData; selected?: boolean }> = ({
  data,
  selected,
}) => {
  const shapeStyle = {
    rectangle: "rounded-lg",
    circle: "rounded-full aspect-square",
    diamond: "rotate-45",
  };

  return (
    <div
      className={`flex items-center justify-center border-2 min-w-[100px] min-h-[60px] transition-all ${
        shapeStyle[data.shape] || "rounded-lg"
      } ${
        selected
          ? "border-blue-500 shadow-md"
          : "border-gray-300 hover:shadow-sm"
      }`}
      style={{
        backgroundColor: data.backgroundColor || "#ffffff",
        borderColor: selected ? "#3b82f6" : data.borderColor || "#d1d5db",
        transform: data.shape === "diamond" ? "rotate(-45deg)" : "none",
      }}
    >
      <div
        className={`text-center ${data.shape === "diamond" ? "-rotate-45" : ""}`}
        style={{
          color: data.textColor || "#000000",
          fontSize: data.fontSize || 14,
        }}
      >
        {data.label}
      </div>
    </div>
  );
};

const IconNode: FC<{ data: IconNodeData; selected?: boolean }> = ({
  data,
  selected,
}) => {
  const icons: Record<string, ReactNode> = {
    database: <Database size={24} />,
    cloud: <Cloud size={24} />,
    server: <Server size={24} />,
    users: <Users size={24} />,
    workflow: <Workflow size={24} />,
    brain: <Brain size={24} />,
    network: <Network size={24} />,
    git: <GitBranch size={24} />,
    message: <MessageSquare size={24} />,
    cpu: <Cpu size={24} />,
    shield: <Shield size={24} />,
    layout: <Layout size={24} />,
    fork: <GitFork size={24} />,
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 min-w-[80px] min-h-[80px] transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-300 bg-white hover:shadow-sm"
      }`}
      style={{
        backgroundColor: data.backgroundColor || "#ffffff",
        borderColor: selected ? "#3b82f6" : data.borderColor || "#d1d5db",
      }}
    >
      <div style={{ color: data.iconColor || "#3b82f6" }}>
        {icons[data.iconType] || <Zap size={24} />}
      </div>
      <div
        className="text-xs mt-1 text-center font-medium"
        style={{ color: data.textColor || "#000000" }}
      >
        {data.label}
      </div>
    </div>
  );
};

// --------------------
// Node Types Configuration
// --------------------
const nodeTypes: NodeTypes = {
  text: TextNode,
  shape: ShapeNode,
  icon: IconNode,
};

// --------------------
// Custom Edge Types
// --------------------
const CustomEdge: FC<any> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
  selected,
}) => {
  const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: selected ? "#3b82f6" : data?.color || "#b1b1b7",
          strokeWidth: selected ? 3 : data?.width || 2,
          strokeDasharray:
            data?.style === "dashed"
              ? "5,5"
              : data?.style === "dotted"
                ? "2,2"
                : "none",
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{
              fontSize: 12,
              fill: data?.textColor || "#000000",
              fontWeight: "500",
            }}
            startOffset="50%"
            textAnchor="middle"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// --------------------
// Toolbar Components
// --------------------
interface NodeTemplate {
  type: string;
  label: string;
  icon: ReactNode;
  data: Partial<TextNodeData | ShapeNodeData | IconNodeData>;
}

const NodeToolbar: FC<{ onAddNode: (type: string, data?: any) => void }> = ({
  onAddNode,
}) => {
  const nodeTemplates: NodeTemplate[] = [
    {
      type: "text",
      label: "Text",
      icon: <Type size={16} />,
      data: { label: "New Text", fontSize: 14, backgroundColor: "#ffffff" },
    },
    {
      type: "shape",
      label: "Rectangle",
      icon: <Square size={16} />,
      data: {
        label: "Rectangle",
        shape: "rectangle",
        backgroundColor: "#f0f9ff",
      },
    },
    {
      type: "shape",
      label: "Circle",
      icon: <Circle size={16} />,
      data: { label: "Circle", shape: "circle", backgroundColor: "#f0fdf4" },
    },
    {
      type: "shape",
      label: "Diamond",
      icon: <Diamond size={16} />,
      data: { label: "Diamond", shape: "diamond", backgroundColor: "#fef7ff" },
    },
    {
      type: "icon",
      label: "Database",
      icon: <Database size={16} />,
      data: {
        label: "Database",
        iconType: "database",
        backgroundColor: "#eff6ff",
      },
    },
    {
      type: "icon",
      label: "Cloud",
      icon: <Cloud size={16} />,
      data: { label: "Cloud", iconType: "cloud", backgroundColor: "#f0fdfa" },
    },
    {
      type: "icon",
      label: "Server",
      icon: <Server size={16} />,
      data: { label: "Server", iconType: "server", backgroundColor: "#fefce8" },
    },
    {
      type: "icon",
      label: "Users",
      icon: <Users size={16} />,
      data: { label: "Users", iconType: "users", backgroundColor: "#fdf2f8" },
    },
    {
      type: "icon",
      label: "AI",
      icon: <Brain size={16} />,
      data: {
        label: "AI Service",
        iconType: "brain",
        backgroundColor: "#faf5ff",
      },
    },
    {
      type: "icon",
      label: "Network",
      icon: <Network size={16} />,
      data: {
        label: "Network",
        iconType: "network",
        backgroundColor: "#fff7ed",
      },
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2 p-4 bg-background/95 backdrop-blur-sm rounded-lg border shadow-sm">
        {nodeTemplates.map((template) => (
          <Tooltip key={template.label}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddNode(template.type, template.data)}
                className="flex items-center gap-2 hover:scale-105 transition-transform"
              >
                {template.icon}
                <span className="hidden sm:inline">{template.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Add {template.label} Node</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

// --------------------
// Settings Panel
// --------------------
interface SettingsPanelProps {
  selectedNode: CustomNode | null;
  onUpdateNode: (nodeId: string, updates: any) => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({
  selectedNode,
  onUpdateNode,
}) => {
  if (!selectedNode) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Select a node to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-semibold text-lg border-b pb-2">Node Properties</h3>

      <div className="space-y-3">
        <Label htmlFor="node-label" className="text-sm font-medium">
          Label
        </Label>
        <Input
          id="node-label"
          value={selectedNode.data.label || ""}
          onChange={(e) =>
            onUpdateNode(selectedNode.id, { label: e.target.value })
          }
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="bg-color" className="text-sm font-medium">
            Background
          </Label>
          <Input
            id="bg-color"
            type="color"
            value={selectedNode.data.backgroundColor || "#ffffff"}
            onChange={(e) =>
              onUpdateNode(selectedNode.id, { backgroundColor: e.target.value })
            }
            className="w-full h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="text-color" className="text-sm font-medium">
            Text Color
          </Label>
          <Input
            id="text-color"
            type="color"
            value={selectedNode.data.textColor || "#000000"}
            onChange={(e) =>
              onUpdateNode(selectedNode.id, { textColor: e.target.value })
            }
            className="w-full h-10"
          />
        </div>
      </div>

      {selectedNode.type === "text" && (
        <div className="space-y-2">
          <Label htmlFor="font-size" className="text-sm font-medium">
            Font Size: {selectedNode.data.fontSize || 14}px
          </Label>
          <Slider
            id="font-size"
            min={8}
            max={32}
            step={1}
            value={[selectedNode.data.fontSize || 14]}
            onValueChange={([value]) =>
              onUpdateNode(selectedNode.id, { fontSize: value })
            }
            className="w-full"
          />
        </div>
      )}

      {selectedNode.type === "shape" && (
        <div className="space-y-2">
          <Label htmlFor="shape-type" className="text-sm font-medium">
            Shape Type
          </Label>
          <Select
            value={selectedNode.data.shape || "rectangle"}
            onValueChange={(value: "rectangle" | "circle" | "diamond") =>
              onUpdateNode(selectedNode.id, { shape: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rectangle">Rectangle</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedNode.type === "icon" && (
        <div className="space-y-2">
          <Label htmlFor="icon-type" className="text-sm font-medium">
            Icon Type
          </Label>
          <Select
            value={selectedNode.data.iconType || "database"}
            onValueChange={(value: string) =>
              onUpdateNode(selectedNode.id, { iconType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="cloud">Cloud</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="workflow">Workflow</SelectItem>
              <SelectItem value="brain">AI</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="message">Message</SelectItem>
              <SelectItem value="cpu">CPU</SelectItem>
              <SelectItem value="shield">Shield</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

// --------------------
// Main Component
// --------------------
const DiagramInfo: FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(
    ConnectionMode.Strict,
  );
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Load diagram
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

        try {
          const parsedNodes: CustomNode[] =
            typeof data.nodes === "string"
              ? JSON.parse(data.nodes)
              : data.nodes || [];
          const parsedEdges: CustomEdge[] =
            typeof data.edges === "string"
              ? JSON.parse(data.edges)
              : data.edges || [];

          setNodes(parsedNodes);
          setEdges(parsedEdges);
        } catch (error) {
          console.error("Error parsing diagram data:", error);
          setNodes([]);
          setEdges([]);
        }
      })
      .catch((err) => console.error("Failed to load diagram:", err))
      .finally(() => setLoading(false));
  }, [id, setNodes, setEdges]);

  // Save diagram
  const saveDiagram = async (): Promise<void> => {
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

  // Delete diagram
  const deleteDiagram = async (): Promise<void> => {
    if (!diagram) return;
    if (!confirm("Are you sure you want to delete this diagram?")) return;

    try {
      await deleteDiagramAction({ id: diagram.id });
      router.push("/diagrams");
    } catch (err) {
      console.error("Failed to delete diagram:", err);
    }
  };

  // ReactFlow handlers
  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "custom",
            data: { style: "solid", width: 2 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: CustomNode) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Node operations
  const addNode = useCallback(
    (type: string, templateData: any = {}): void => {
      const position: XYPosition = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      };

      const baseNode: CustomNode = {
        id: uuidv4(),
        type: type as any,
        position,
        data: {
          label: templateData.label || "New Node",
          ...templateData,
        },
      };

      setNodes((nds) => [...nds, baseNode]);
    },
    [setNodes],
  );

  const updateNode = useCallback(
    (nodeId: string, updates: any): void => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n,
        ),
      );
    },
    [setNodes],
  );

  const deleteSelected = useCallback((): void => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const duplicateSelected = useCallback((): void => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const newNodes = selectedNodes.map((n) => ({
      ...n,
      id: uuidv4(),
      position: { x: n.position.x + 50, y: n.position.y + 50 },
      selected: false,
    }));
    setNodes((nds) => [...nds, ...newNodes]);
  }, [nodes, setNodes]);

  // Export/Import
  const exportDiagram = useCallback((): void => {
    const data = {
      title,
      description,
      nodes,
      edges,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "diagram"}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [title, description, nodes, edges]);

  const importDiagram = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setTitle(data.title || "");
          setDescription(data.description || "");
          setNodes(data.nodes || []);
          setEdges(data.edges || []);

          // Reset file input
          event.target.value = "";
        } catch (err) {
          console.error("Failed to import diagram:", err);
          alert("Failed to import diagram file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges],
  );

  // Layout helpers
  const arrangeNodes = useCallback(() => {
    const arrangedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 3) * 300 + 100,
        y: Math.floor(index / 3) * 200 + 100,
      },
    }));
    setNodes(arrangedNodes);
    setTimeout(() => fitView(), 100);
  }, [nodes, setNodes, fitView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading diagram...</p>
        </div>
      </div>
    );
  }

  if (!diagram) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Diagram not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">Diagram Editor</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportDiagram}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById("import-input")?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              id="import-input"
              type="file"
              accept=".json"
              onChange={importDiagram}
              className="hidden"
            />
          </Button>
          <Button variant="destructive" onClick={deleteDiagram}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Diagram Info */}
          <div className="space-y-4 bg-card p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold">Diagram Properties</h3>
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
                placeholder="Enter diagram title"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                rows={3}
                placeholder="Enter diagram description"
              />
            </div>
            <Button
              onClick={saveDiagram}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Diagram"}
            </Button>
          </div>

          {/* Settings Panel */}
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <SettingsPanel
              selectedNode={selectedNode}
              onUpdateNode={updateNode}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={deleteSelected}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={duplicateSelected}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => fitView()}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Fit View
                </Button>
                <Button
                  onClick={arrangeNodes}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Arrange
                </Button>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="grid-toggle" className="text-sm">
                  Show Grid
                </Label>
                <Switch
                  id="grid-toggle"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagram Area */}
        <div className="lg:col-span-3">
          <div
            className="bg-card rounded-lg border shadow-sm h-[800px]"
            ref={reactFlowWrapper}
          >
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange as any}
                onEdgesChange={onEdgesChange as any}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                connectionMode={connectionMode}
                fitView
                deleteKeyCode={["Backspace", "Delete"]}
                selectionKeyCode={["Shift"]}
                multiSelectionKeyCode={["Meta", "Control"]}
                zoomOnScroll={false}
                zoomOnPinch={true}
                panOnScroll={true}
                panOnScrollSpeed={1}
                selectionOnDrag={true}
              >
                <Panel position="top-left" className="flex gap-2">
                  <NodeToolbar onAddNode={addNode} />
                </Panel>

                <Panel
                  position="top-right"
                  className="flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-sm"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setConnectionMode(
                              connectionMode === ConnectionMode.Strict
                                ? ConnectionMode.Loose
                                : ConnectionMode.Strict,
                            )
                          }
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Connection Mode:{" "}
                        {connectionMode === ConnectionMode.Strict
                          ? "Strict"
                          : "Loose"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Panel>

                <Panel position="bottom-right" className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => zoomIn()}>
                    +
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => zoomOut()}>
                    -
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fitView()}>
                    Fit
                  </Button>
                </Panel>

                <Controls />
                <MiniMap
                  nodeStrokeColor="#1f2937"
                  nodeColor="#f3f4f6"
                  maskColor="rgba(255, 255, 255, 0.6)"
                  position="bottom-left"
                />
                {showGrid && (
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="#e5e7eb"
                  />
                )}
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramInfo;
