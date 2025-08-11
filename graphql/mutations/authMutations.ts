import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($data: CreateUserInput!) {
    register(data: $data)
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($data: LoginInput!) {
    login(data: $data)
  }
`;