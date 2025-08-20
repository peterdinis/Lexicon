"use client";

import { useQuery } from "@apollo/client";
import { GET_TEMPLATES } from "@/graphql/queries/templates/templatesQueries";

export const useGetAllTemplates = () => {
	const { data, loading, error } = useQuery(GET_TEMPLATES);

	return {
		templates: data?.templates ?? [],
		loading,
		error,
	};
};
