"use client";

import { motion } from "framer-motion";
import type { FC } from "react";
import { useQuery } from "@apollo/client";
import DashboardLayout from "../dashboard/DashboardLayout";
import { GET_NOTES } from "@/graphql/queries/notes/notesQueries";

const NotesWrapper: FC = () => {
  const { data, loading, error } = useQuery(GET_NOTES);

  if (loading) return <DashboardLayout><div className="p-6">Loading notes...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-6 text-red-500">Error loading notes: {error.message}</div></DashboardLayout>;

  const notes = data?.notes ?? [];

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">My Notes</h2>
        <div className="grid gap-4">
          {notes.length === 0 && <p className="text-gray-500">No notes available.</p>}
          {notes.map((note: any, index: number) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-stone-900 shadow p-4 cursor-pointer hover:shadow-lg transition"
            >
              <h3 className="font-medium text-lg">{note.name}</h3>
              <p className="text-gray-400 mt-1 text-sm">{note.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotesWrapper;
