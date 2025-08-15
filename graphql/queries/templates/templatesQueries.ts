import { gql } from '@apollo/client';

export const GET_TEMPLATES = gql`
  query GetTemplates {
    getTemplates {
      id
      title
      blocks
    }
  }
`;

export const GET_TEMPLATE = gql`
  query GetTemplate($id: String!) {
    getTemplate(id: $id) {
      id
      title
      blocks
    }
  }
`;