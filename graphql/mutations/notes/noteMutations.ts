import { gql } from "@apollo/client";

export const CREATE_NOTE = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      title
      content
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
      id
      title
      content
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
