"use client"

import { CREATE_WORKSPACE } from "@/graphql/mutations/workspaces/workspaceMutations";
import { useMutation } from "@apollo/client";
import { useToast } from "../shared/use-toast";

export const useCreateWorkspace = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void;
  onFailure?: () => void;
} = {}) => {

  const { toast } = useToast();
  const [createWorkspace, { loading, error }] = useMutation(CREATE_WORKSPACE, {
    onCompleted: () => {
      toast({
        title: "New workspace is created",
        duration: 2000,
        className: "bg-green-800 text-white font-bold text-xl",
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating workspace:", error);
      toast({
        title: "New workspace was not created",
        duration: 2000,
        className: "bg-red-800 text-white font-bold text-xl",
      });
      onFailure?.();
    },
  });

  return { createWorkspace, loading, error };
};
