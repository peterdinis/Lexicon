"use client";

import { type FC, useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { CREATE_NOTE } from "@/graphql/mutations/notes/noteMutations";

const NotesSection: FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const [createNote, { loading }] = useMutation(CREATE_NOTE, {
    onCompleted: () => {
      toast.success("Note saved successfully!");
      setName("");
      setDescription("");
      setContent("");
    },
    onError: (error) => {
      toast.error(`Failed to save note: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!name.trim() || !content.trim()) {
      toast.error("Please enter name and content.");
      return;
    }

    createNote({
      variables: {
        input: {
          name,
          description,
          content,
        },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick note</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Note name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Textarea
          placeholder="Jot something down..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-32"
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save note"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesSection;
