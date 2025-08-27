import { CREATE_NOTE } from "@/graphql/mutations/notes/noteMutations";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";

export const useCreateNote = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
} = {}) => {
  const [createNote, { loading, error }] = useMutation(CREATE_NOTE, {
    onCompleted: () => {
      toast.success("Note saved successfully!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to save note: ${error.message}`);
      onFailure?.(error);
    },
  });

  return { createNote, loading, error };
};
