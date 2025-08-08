"use client"

import { FC, ReactNode } from "react"
import { ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';

type GraphqlProviderProps = {
    children?: ReactNode
}

const client = new ApolloClient({
  uri: '',
  cache: new InMemoryCache(),
});

const GraphqlProvider: FC<GraphqlProviderProps> = ({
    children
}) => {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    )
}
export default GraphqlProvider