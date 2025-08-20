import { gql } from "@apollo/client";

export const GET_WORKSPACES = gql`
  query Workspaces($query: WorkspaceQueryInput) {
    workspaces(query: $query) {
      items {
        id
        name
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const GET_WORKSPACE = gql`
  query Workspace($id: Int!) {
    workspace(id: $id) {
      id
      name
      createdAt
      updatedAt
      pages {
        id
        title
      }
    }
  }
`;

export const GET_CURRENT_WORKSPACE = gql`
  query CurrentWorkspace($userId: Int!) {
    currentWorkspace(userId: $userId) {
      id
      name
      description
      createdAt
    }
  }
`;
