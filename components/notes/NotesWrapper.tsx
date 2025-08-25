"use client"

import { FC } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../dashboard/DashboardLayout";

// Example custom data
const notes = [
    { id: 1, title: "Meeting Notes", content: "Discuss project roadmap and deadlines." },
    { id: 2, title: "Ideas", content: "Explore AI-assisted writing features." },
    { id: 3, title: "Shopping List", content: "Milk, Coffee, Notebooks." },
];

const NotesWrapper: FC = () => {
    return (
        <DashboardLayout>
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">My Notes</h2>
                <div className="grid gap-4">
                    {notes.map((note, index) => (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ scale: 1.02 }}
                            className="rounded-2xl bg-stone-900  shadow p-4 cursor-pointer hover:shadow-lg transition"
                        >
                            <h3 className="font-medium text-lg">{note.title}</h3>
                            <p className="text-gray-600 mt-1 text-sm">{note.content}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NotesWrapper;
