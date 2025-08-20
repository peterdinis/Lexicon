import { gql } from "@apollo/client";

export const SEARCH_QUERY = gql`
	query Search($query: String!) {
  search(query: $query) {
    users {
      id
      name
      email
    }
    pages {
      id
      title
    }
    workspaces {
      id
      name
    }
    tasks {
      id
      title
      status
    }
    events {
      id
      title
      date
    }
  }
}
`;
