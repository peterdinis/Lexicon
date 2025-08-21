import { gql } from "@apollo/client";

export const CREATE_PAGE = gql`
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      id
      title
      emoji
    }
  }
`;
