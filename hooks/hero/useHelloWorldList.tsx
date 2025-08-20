"use client";

import { useQuery } from "@apollo/client";
import { GET_HELLO_WORLD_LIST } from "@/graphql/queries/global/helloQuery";

export const useHelloWorldList = () => {
	const { data, loading, error } = useQuery(GET_HELLO_WORLD_LIST);

	return {
		helloWorldList: data?.helloWorldList ?? [],
		loading,
		error,
	};
};
