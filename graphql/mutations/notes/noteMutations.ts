import { gql } from "@apollo/client";

export const CREATE_NOTE = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      name
      description
      content
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
      id
      name
      description
      content
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_NOTE = gql`
  mutation RemoveNote($id: ID!) {
    removeNote(id: $id) {
      id
    }
  }
`;
