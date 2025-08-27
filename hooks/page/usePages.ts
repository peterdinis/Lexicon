import { GET_PAGES } from "@/graphql/queries/pages/pagesQueries";
import { useQuery } from "@apollo/client";

export const usePages = (workspaceId: number) => {
  const { data, loading, error, refetch } = useQuery(GET_PAGES, {
    variables: { workspaceId },
  });

  return {
    pages: data?.pageTree ?? [],
    loading,
    error,
    refetch,
  };
};
