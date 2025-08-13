import { gql } from "@apollo/client";

export const GET_HELLO_WORLD_LIST = gql`
  query {
    getHelloWorldList {
      message
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      lastName
    }
  }
`;
