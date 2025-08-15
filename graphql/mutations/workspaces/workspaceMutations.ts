import { gql } from "@apollo/client";

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
    updateWorkspace(input: $input) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_WORKSPACE = gql`
  mutation RemoveWorkspace($id: Int!) {
    removeWorkspace(id: $id) {
      id
      name
    }
  }
`;

export const SET_CURRENT_WORKSPACE = gql`
  mutation SetCurrentWorkspace($id: Int!) {
    setCurrentWorkspace(id: $id) {
      id
      currentWorkspaceId
    }
  }
`;
