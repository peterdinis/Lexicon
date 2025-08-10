"use client";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import type { FC, ReactNode } from "react";

type GraphqlProviderProps = {
	children?: ReactNode;
};

const client = new ApolloClient({
	uri: "http://localhost:4000/graphql", // TODO: Later move this to env variable
	cache: new InMemoryCache(),
});

const GraphqlProvider: FC<GraphqlProviderProps> = ({ children }) => {
	return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
export default GraphqlProvider;
