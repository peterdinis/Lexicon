import { gql } from "@apollo/client";

// TODO: Blocks issues with queries

export const GET_TEMPLATES = gql`
  query GetTemplates {
    getTemplates {
      id
      title
    }
  }
`;

export const GET_TEMPLATE = gql`
  query GetTemplate($id: String!) {
    getTemplate(id: $id) {
      id
      title
    }
  }
`;
