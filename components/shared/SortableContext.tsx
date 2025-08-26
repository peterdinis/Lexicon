"use client";

import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (props: { setNodeRef: any; style: any; listeners: any; attributes: any }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return <>{children({ setNodeRef, style, listeners, attributes })}</>;
}

