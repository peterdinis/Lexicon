"use client";

import { motion } from "framer-motion";
import type { FC } from "react";
import { useQuery} from "@apollo/client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DashboardLayout from "../dashboard/DashboardLayout";
import { GET_NOTES } from "@/graphql/queries/notes/notesQueries";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useRemoveNote } from "@/hooks/notes/useRemoveNote";
import { useUpdateNote } from "@/hooks/notes/useUpdateNote";

interface FormValues {
  name: string;
  content: string;
}

const NotesWrapper: FC = () => {
  const { data, loading, error} = useQuery(GET_NOTES);
  const { updateNote } = useUpdateNote();
  const { removeNote } = useRemoveNote();

  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { name: "", content: "" } });

  if (loading) return <DashboardLayout><div className="p-6"><Loader2 className="animate-spin w-8 h-8" /></div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-6 text-red-500">Error loading notes: {error.message}</div></DashboardLayout>;

  const notes = data?.notes ?? [];

  const onSubmit = (formData: FormValues) => {
    if (!selectedNote) return;
    updateNote({ variables: { input: { id: selectedNote.id, ...formData } } });
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold">My Notes</h2>

        {/* List of notes */}
        <div className="grid gap-4">
          {notes.length === 0 && <p className="text-gray-500">No notes available.</p>}
          {notes.map((note: any, index: number) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-stone-900 shadow p-4 hover:shadow-lg transition"
            >
              <h3 className="font-medium text-lg">{note.name}</h3>
              <p className="text-gray-400 mt-1 text-sm">{note.content}</p>
              <div className="flex space-x-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedNote(note);
                    reset({ name: note.name, content: note.content });
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this note?")) {
                      removeNote({ variables: { id: note.id } });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            {selectedNote && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Note name" />}
                />
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => <Textarea {...field} placeholder="Note content" className="min-h-24" />}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="submit">Save</Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (selectedNote) {
                        removeNote({ variables: { id: selectedNote.id } });
                        setDialogOpen(false);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default NotesWrapper;
