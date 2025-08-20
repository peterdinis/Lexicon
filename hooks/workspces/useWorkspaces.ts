"use client";

import { useMutation, useQuery } from "@apollo/client";
import { SWITCH_WORKSPACE } from "@/graphql/mutations/workspaces/workspaceMutations";
import { GET_WORKSPACES } from "@/graphql/queries/workspaces/workspaceQueries";

export type Workspace = {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
};

export const useWorkspaces = () => {
	const { data, loading, error, refetch } = useQuery<{
		workspaces: { items: Workspace[] };
	}>(GET_WORKSPACES);
	const workspaces = data?.workspaces?.items || [];

	const [switchWorkspaceMutation, { loading: switchLoading }] = useMutation(
		SWITCH_WORKSPACE,
		{
			refetchQueries: ["CurrentWorkspace"],
		},
	);

	const switchWorkspace = async (userId: number, workspaceId: number) => {
		return switchWorkspaceMutation({
			variables: { userId, workspaceId },
		});
	};

	return {
		workspaces,
		loading,
		error,
		refetch,
		switchWorkspace,
		switchLoading,
	};
};
