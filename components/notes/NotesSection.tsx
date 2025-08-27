"use client";

import { type FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useMe } from "@/hooks/auth/useMe";
import { Loader2 } from "lucide-react";
import { useCreateNote } from "@/hooks/notes/useCreateNote";

interface FormValues {
  name: string;
  description?: string;
  content: string;
}

const NotesSection: FC = () => {
  const { me: currentUser, loading: meLoading } = useMe();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      content: "",
    },
  });

  const { createNote, loading } = useCreateNote({
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!currentUser) {
      toast.error("You must be logged in to save a note.");
      return;
    }

    createNote({
      variables: {
        input: {
          ...data,
          createdBy: currentUser.id,
        },
      },
    });
  };

  if (meLoading) return <Loader2 className="animate-spin w-8 h-8" />;

  return (
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
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Note name"
                aria-invalid={!!errors.name}
              />
            )}
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Description (optional)" />
            )}
          />

          <Controller
            name="content"
            control={control}
            rules={{ required: "Content is required" }}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Jot something down..."
                className="min-h-32"
                aria-invalid={!!errors.content}
              />
            )}
          />
          {errors.content && <p className="text-red-500">{errors.content.message}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-8 h-8" /> : "Save note"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotesSection;
