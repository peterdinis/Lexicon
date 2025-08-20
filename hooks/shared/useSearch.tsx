"use client";

import { SEARCH_QUERY } from "@/graphql/queries/global/searchQueries";
import { useLazyQuery } from "@apollo/client";

export function useSearch() {
  const [search, { data, loading, error }] = useLazyQuery(SEARCH_QUERY, {
    fetchPolicy: "no-cache",
  });

  // keep it simple: pass the query string only
  const runSearch = (query: string) => {
    return search({ variables: { query } });
  };

  return {
    runSearch,
    data,
    loading,
    error,
  };
}
