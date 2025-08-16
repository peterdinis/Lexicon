"use client"

import { ME_QUERY } from "@/graphql/queries/auth/authQueries";
import { useQuery } from "@apollo/client";

export type Me = {
  id: number;
  email: string;
  name?: string;
};

export const useMe = () => {
  const { data, loading, error } = useQuery<{ me: Me }>(ME_QUERY);

  return {
    me: data?.me ?? null,
    loading,
    error,
  };
};