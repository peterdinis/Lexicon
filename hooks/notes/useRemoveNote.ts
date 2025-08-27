import { useMutation } from "@apollo/client";
import { REMOVE_NOTE } from "@/graphql/mutations/notes/noteMutations";
import { GET_NOTES } from "@/graphql/queries/notes/notesQueries";
import { toast } from "sonner";

export const useRemoveNote = () => {
  const [removeNote, { loading, error }] = useMutation(REMOVE_NOTE, {
    refetchQueries: [{ query: GET_NOTES }],
    onCompleted: () => {
      toast.success("Note deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete note: ${error.message}`);
      console.error(error);
    },
  });

  return { removeNote, loading, error };
};
