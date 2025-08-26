import { gql } from "@apollo/client";

export const GET_NOTES = gql`
  query GetNotes {
    notes {
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

export const GET_NOTE = gql`
  query GetNote($id: ID!) {
    note(id: $id) {
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
