import { useMutation } from "@apollo/client";
import { UPDATE_NOTE } from "@/graphql/mutations/notes/noteMutations";
import { GET_NOTES } from "@/graphql/queries/notes/notesQueries";
import { toast } from "sonner";

export const useUpdateNote = () => {
  const [updateNote, { loading, error }] = useMutation(UPDATE_NOTE, {
    refetchQueries: [{ query: GET_NOTES }],
    onCompleted: () => {
      toast.success("Note updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update note: ${error.message}`);
      console.error(error);
    },
  });

  return { updateNote, loading, error };
};
