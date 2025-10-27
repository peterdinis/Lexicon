"use client";

import { quickSearchAction, searchAction } from "@/actions/searchActions";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useRef, useState, useEffect } from "react";

export const useSearch = () => {
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { execute, result, status } = useAction(searchAction, {
    onSuccess: (data) => {
      if (data.data?.success && data.data.data) {
        setLocalResults(data.data.data.results || []);
      } else {
        setLocalResults([]);
      }
    },
    onError: (error) => {
      setLocalResults([]);
    },
  });

  const { execute: quickExecute, result: quickResult } = useAction(
    quickSearchAction,
    {
      onSuccess: (data) => {
        if (data.data?.success && data.data.data) {
          setLocalResults(data.data.data.results || []);
        }
      },
      onError: (error) => {
        setLocalResults([]);
      },
    },
  );

  const search = useCallback(
    (
      query: string,
      types?: string[],
      limit?: number,
      immediate: boolean = false,
    ) => {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      setSearchQuery(query);

      if (query.trim().length < 2) {
        setLocalResults([]);
        return;
      }

      const searchTypes = types || [
        "pages",
        "todos",
        "events",
        "diagrams",
        "folders",
      ];
      const searchLimit = limit || 10;

      if (immediate) {
        execute({
          query: query.trim(),
          limit: searchLimit,
        });
      } else {
        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
          execute({
            query: query.trim(),
            limit: searchLimit,
          });
        }, 300);
      }
    },
    [execute],
  );

  const quickSearch = useCallback(
    (query: string) => {
      if (query.trim().length < 2) {
        setLocalResults([]);
        return;
      }

      quickExecute({ query: query.trim() });
    },
    [quickExecute],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Use results from either search or quick search
  const results =
    result.data?.data?.results ||
    quickResult.data?.data?.results ||
    localResults;

  return {
    search,
    quickSearch,
    results,
    loading: status === "executing",
    error: result.serverError || quickResult.serverError,
    data: result.data || quickResult.data,
    searchQuery,
  };
};
