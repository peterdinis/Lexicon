"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

// Types for sortable listeners
export type SortableListeners = {
  onPointerDown?: React.PointerEventHandler;
  onTouchStart?: React.TouchEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onKeyDown?: React.KeyboardEventHandler;
};

export type SortableAttributes = {
  role?: string;
  tabIndex?: number;
  "aria-pressed"?: boolean;
  [key: string]: any
};

// Props passed to children
export type SortableChildProps = {
  setNodeRef: (element: HTMLElement | null) => void;
  style: React.CSSProperties;
  listeners?: SortableListeners;
  attributes?: SortableAttributes;
};

interface SortableItemProps {
  id: string;
  children: (props: SortableChildProps) => React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return <>{children({ setNodeRef, style, listeners, attributes })}</>;
}
