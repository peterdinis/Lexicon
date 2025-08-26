"use client";

import { type FC, useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Loader2, Edit, Trash } from "lucide-react";
import { useMe } from "@/hooks/auth/useMe";
import { CREATE_NOTE, UPDATE_NOTE, REMOVE_NOTE } from "@/graphql/mutations/notes/noteMutations";

interface FormValues {
  name: string;
  description?: string;
  content: string;
}

interface Note {
  id: string;
  name: string;
  description?: string;
  content: string;
  createdBy: string;
}

const NotesSection: FC = () => {
  const { me: currentUser, loading: meLoading } = useMe();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<FormValues>({ defaultValues: { name: "", description: "", content: "" } });

  const [createNote, { loading: creating }] = useMutation(CREATE_NOTE, {
    onCompleted: (data) => {
      toast.success("Note saved successfully!");
      setNotes((prev) => [...prev, data.createNote]);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const [updateNote, { loading: updating }] = useMutation(UPDATE_NOTE, {
    onCompleted: (data) => {
      toast.success("Note updated!");
      setNotes((prev) =>
        prev.map((n) => (n.id === data.updateNote.id ? data.updateNote : n))
      );
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const [removeNote, { loading: removing }] = useMutation(REMOVE_NOTE, {
    onCompleted: (data) => {
      toast.success("Note removed!");
      setNotes((prev) => prev.filter((n) => n.id !== data.removeNote.id));
    },
    onError: (err) => toast.error(err.message),
  });

  // Fetch notes initially (for demo purposes, could use useQuery(GET_NOTES))
  useEffect(() => {
    // Replace with real query or server fetch
    setNotes([]);
  }, []);

  const onSubmit = (data: FormValues) => {
    if (!currentUser) return toast.error("You must be logged in to save a note.");
    if (selectedNote) {
      updateNote({ variables: { input: { id: selectedNote.id, ...data } } });
    } else {
      createNote({ variables: { input: { ...data, createdBy: currentUser.id } } });
    }
  };

  if (meLoading) return <Loader2 className="animate-spin w-8 h-8" />;

  return (
    <div className="space-y-4">
      {/* Quick create note */}
      <Card>
        <CardHeader>
          <CardTitle>Quick note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => <Input {...field} placeholder="Note name" aria-invalid={!!errors.name} />}
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}

            <Controller
              name="description"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Description (optional)" />}
            />

            <Controller
              name="content"
              control={control}
              rules={{ required: "Content is required" }}
              render={({ field }) => <Textarea {...field} placeholder="Jot something down..." className="min-h-32" aria-invalid={!!errors.content} />}
            />
            {errors.content && <p className="text-red-500">{errors.content.message}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={creating || updating}>
                {(creating || updating) ? <Loader2 className="animate-spin w-6 h-6" /> : selectedNote ? "Update note" : "Save note"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List of notes */}
      {notes.map((note) => (
        <Card key={note.id} className="space-y-2">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>{note.name}</CardTitle>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedNote(note);
                  setValue("name", note.name);
                  setValue("description", note.description || "");
                  setValue("content", note.content);
                  setDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeNote({ variables: { id: note.id } })}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>{note.content}</CardContent>
        </Card>
      ))}

      {/* Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-4">
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              <Controller
                name="content"
                control={control}
                render={({ field }) => <Textarea {...field} />}
              />
              <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={updating}>
                  {updating ? <Loader2 className="animate-spin w-6 h-6" /> : "Update"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    removeNote({ variables: { id: selectedNote.id } });
                    setDialogOpen(false);
                  }}
                  disabled={removing}
                >
                  Delete
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesSection;
