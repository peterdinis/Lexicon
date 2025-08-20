"use client";

import {
	ApolloClient,
	ApolloProvider,
	createHttpLink,
	InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import type { FC, ReactNode } from "react";

type GraphqlProviderProps = {
	children?: ReactNode;
};

const httpLink = createHttpLink({
	uri: "http://localhost:4000/graphql", // TODO: Later move this to env variable
});

const authLink = setContext((_, { headers }) => {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});

const GraphqlProvider: FC<GraphqlProviderProps> = ({ children }) => {
	return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default GraphqlProvider;
