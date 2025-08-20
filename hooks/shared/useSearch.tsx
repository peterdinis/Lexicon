import { useLazyQuery } from "@apollo/client";
import { useCallback, useRef, useState } from "react";
import { SEARCH_QUERY } from "@/graphql/queries/global/searchQueries";

export function useSearch() {
	const [search, { data, error }] = useLazyQuery(SEARCH_QUERY, {
		fetchPolicy: "no-cache",
	});
	const [loading, setLoading] = useState(false);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	const runSearch = useCallback(
		(query: string) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
			return new Promise<void>((resolve, reject) => {
				debounceRef.current = setTimeout(async () => {
					try {
						setLoading(true);
						await search({ variables: { query } });
						resolve();
					} catch (err) {
						reject(err);
					} finally {
						setLoading(false);
					}
				}, 400);
			});
		},
		[search],
	);

	return { runSearch, data, error, loading };
}
