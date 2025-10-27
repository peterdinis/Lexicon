"use client"

import { quickSearchAction, searchAction } from "@/actions/searchActions";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useRef, useState } from "react";

export const useSearch = () => {
  const [localResults, setLocalResults] = useState<any[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { execute, result, status } = useAction(searchAction, {
    onSuccess: (data) => {
      if (data.data) {
        setLocalResults(data.data.data.results || []);
      }
    }
  });

  const { execute: quickExecute } = useAction(quickSearchAction);

  const search = useCallback((
    query: string, 
    types?: string[], 
    limit?: number,
    immediate: boolean = false
  ) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setLocalResults([]);
      return;
    }

    if (immediate) {
      execute({
        query: query.trim(),
        types: types as any || ["pages", "blocks", "todos"],
        limit: limit || 10
      });
    } else {
      // Debounce search
      searchTimeoutRef.current = setTimeout(() => {
        execute({
          query: query.trim(),
          types: types as any || ["pages", "blocks", "todos"],
          limit: limit || 10
        });
      }, 300);
    }
  }, [execute]);

  const quickSearch = useCallback((query: string) => {
    if (query.trim().length < 2) {
      setLocalResults([]);
      return;
    }

    quickExecute({ query: query.trim() });
  }, [quickExecute]);

  return {
    search,
    quickSearch,
    results: result.data?.data?.results || localResults,
    loading: status === "executing",
    error: result.serverError,
    data: result.data
  };
};