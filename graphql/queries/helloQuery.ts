import { gql } from '@apollo/client';

export const GET_HELLO_WORLD_LIST = gql`
  query {
    getHelloWorldList {
      message
    }
  }
`;