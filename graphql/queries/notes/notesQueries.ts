import { gql } from "@apollo/client";

export const GET_NOTES = gql`
  query GetNotes {
    notes {
      id
      title
      content
    }
  }
`;

export const GET_NOTE = gql`
  query GetNote($id: ID!) {
    note(id: $id) {
      id
      title
      content
    }
  }
`;
