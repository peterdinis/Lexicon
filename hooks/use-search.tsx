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
      console.log('📨 Search response received:', data);
      if (data.data?.success && data.data.data) {
        setLocalResults(data.data.data.results || []);
        console.log('✅ Search results set:', data.data.data.results?.length);
      } else {
        console.log('⚠️ No results in response');
        setLocalResults([]);
      }
    },
    onError: (error) => {
      console.error('❌ Search error:', error);
      setLocalResults([]);
    },
  });

  const { execute: quickExecute, result: quickResult } = useAction(quickSearchAction, {
    onSuccess: (data) => {
      console.log('📨 Quick search response received:', data);
      if (data.data?.success && data.data.data) {
        setLocalResults(data.data.data.results || []);
      }
    },
    onError: (error) => {
      console.error('❌ Quick search error:', error);
      setLocalResults([]);
    },
  });

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
      console.log('🔍 Search called:', { query, types, limit, immediate });

      if (query.trim().length < 2) {
        console.log('📭 Query too short, clearing results');
        setLocalResults([]);
        return;
      }

      const searchTypes = types || ["pages", "todos", "events", "diagrams", "folders"];
      const searchLimit = limit || 10;

      if (immediate) {
        console.log('🚀 Immediate search execution');
        execute({
          query: query.trim(),
          limit: searchLimit,
        });
      } else {
        // Debounce search
        console.log('⏰ Setting up debounced search');
        searchTimeoutRef.current = setTimeout(() => {
          console.log('🔍 Executing debounced search');
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
      console.log('⚡ Quick search called:', query);
      
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
  const results = result.data?.data?.results || 
                 quickResult.data?.data?.results || 
                 localResults;

  console.log('📊 Current state:', {
    resultsCount: results.length,
    loading: status === "executing",
    hasServerError: !!result.serverError,
    hasQuickSearchError: !!quickResult.serverError
  });

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