"use client"

import { GET_HELLO_WORLD_LIST } from "@/graphql/queries/global/helloQuery";
import { useQuery } from "@apollo/client";

export const useHelloWorldList = () => {
  const { data, loading, error } = useQuery(GET_HELLO_WORLD_LIST);

  return {
    helloWorldList: data?.helloWorldList ?? [],
    loading,
    error,
  };
};