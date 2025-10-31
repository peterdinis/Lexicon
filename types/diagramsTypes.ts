export interface DiagramViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface DiagramUpdateData {
  title?: string;
  description?: string | null;
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  viewport?: DiagramViewport;
  updated_at: Date;
}