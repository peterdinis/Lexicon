"use client"

import { FC, useMemo, useRef, useState } from "react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { toast } from "sonner";
import { useMockPresence } from "@/lib/collabMock";
import { Kanban, Link2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

type TaskItem = { id: string; text: string };
type Column = { id: string; title: string; items: TaskItem[] };

function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const TasksWrapper: FC = () => {
    const initial = useMemo<Column[]>(
        () => [
            {
                id: "todo", title: "To do", items: [
                    { id: uid(), text: "Draft spec" },
                    { id: uid(), text: "Collect feedback" },
                    { id: uid(), text: "Write tests" },
                ]
            },
            {
                id: "inprogress", title: "In progress", items: [
                    { id: uid(), text: "Implement UI" },
                    { id: uid(), text: "Refactor components" },
                ]
            },
            {
                id: "done", title: "Done", items: [
                    { id: uid(), text: "Plan sprint" },
                    { id: uid(), text: "Set up project" },
                ]
            },
        ],
        []
    );

    const [columns, setColumns] = useState<Column[]>(initial);
    const dragRef = useRef<{ colId: string; itemId: string } | null>(null);

    const moveItem = (sourceColId: string, itemId: string, targetColId: string, targetItemId?: string) => {
        setColumns((cols) => {
            const next = cols.map((c) => ({ ...c, items: [...c.items] }));
            const from = next.find((c) => c.id === sourceColId)!;
            const to = next.find((c) => c.id === targetColId)!;
            const idx = from.items.findIndex((t) => t.id === itemId);
            if (idx === -1) return cols;
            const [item] = from.items.splice(idx, 1);
            if (targetItemId) {
                const insertAt = to.items.findIndex((t) => t.id === targetItemId);
                to.items.splice(insertAt === -1 ? to.items.length : insertAt, 0, item);
            } else {
                to.items.push(item);
            }
            return next;
        });
    };

    const onDragStart = (colId: string, itemId: string) => (e: React.DragEvent) => {
        dragRef.current = { colId, itemId };
        e.dataTransfer.effectAllowed = "move";
    };
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };
    const onDropOnItem = (targetColId: string, targetItemId: string) => (e: React.DragEvent) => {
        e.preventDefault();
        const drag = dragRef.current;
        if (drag) moveItem(drag.colId, drag.itemId, targetColId, targetItemId);
        dragRef.current = null;
    };
    const onDropOnColumn = (targetColId: string) => (e: React.DragEvent) => {
        e.preventDefault();
        const drag = dragRef.current;
        if (drag) moveItem(drag.colId, drag.itemId, targetColId);
        dragRef.current = null;
    };

    const addTask = () => {
        const text = `New task ${columns[0].items.length + 1}`;
        setColumns((cols) => {
            const next = cols.map((c) => ({ ...c, items: [...c.items] }));
            next[0].items.unshift({ id: uid(), text });
            return next;
        });
        toast.success("Task added");
    };

    const { users } = useMockPresence();

    return (
        <DashboardLayout>
            <header className="mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Kanban className="h-5 w-5 text-muted-foreground" /> Tasks
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {users.slice(0, 4).map((u) => (
                                <Avatar key={u.id} className="h-7 w-7 ring-2 ring-background">
                                    <AvatarFallback className="text-[10px]">{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                            const link = `${window.location.origin}/app/tasks`;
                            navigator.clipboard?.writeText(link).catch(() => { });
                            toast("Invite link copied (mock)");
                        }}>
                            <Link2 className="h-4 w-4 mr-2" /> Invite
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Drag tasks between columns. Presence is mocked across tabs.</p>
            </header>

            <section className="grid gap-6 md:grid-cols-3 animate-fade-in">
                {columns.map((col) => (
                    <Card key={col.id}>
                        <CardHeader>
                            <CardTitle>{col.title}</CardTitle>
                        </CardHeader>
                        <CardContent onDragOver={onDragOver} onDrop={onDropOnColumn(col.id)}>
                            <ul className="space-y-2 text-sm min-h-[120px]">
                                {col.items.map((t) => (
                                    <li
                                        key={t.id}
                                        draggable
                                        onDragStart={onDragStart(col.id, t.id)}
                                        onDragOver={onDragOver}
                                        onDrop={onDropOnItem(col.id, t.id)}
                                        className="rounded-md border px-3 py-2 bg-background/50 cursor-grab active:cursor-grabbing select-none"
                                        aria-grabbed
                                        role="button"
                                    >
                                        {t.text}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4">
                                <Button size="sm" onClick={addTask}>Add task</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </DashboardLayout>
    )
}

export default TasksWrapper