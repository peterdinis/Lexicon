import { gql } from "@apollo/client";

export const CREATE_CUSTOM_TEMPLATE = gql`
  mutation CreateCustomTemplate($input: CreateTemplateInput!) {
    createCustomTemplate(input: $input) {
      id
      title
      blocks
    }
  }
`;

export const UPDATE_CUSTOM_TEMPLATE = gql`
  mutation UpdateCustomTemplate($input: UpdateTemplateInput!) {
    updateCustomTemplate(input: $input) {
      id
      title
      blocks
    }
  }
`;
