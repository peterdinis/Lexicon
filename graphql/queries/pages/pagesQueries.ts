import { gql } from '@apollo/client';

export const GET_PAGES = gql`
  query GetPages(
    $workspaceId: Int!
    $parentPageId: Int
    $search: String
    $page: Int
    $pageSize: Int
    $isDatabase: Boolean
  ) {
    getPages(
      workspaceId: $workspaceId
      parentPageId: $parentPageId
      search: $search
      page: $page
      pageSize: $pageSize
      isDatabase: $isDatabase
    ) {
      items {
        id
        title
        parentPageId
        sortPosition
        isDatabase
        inTrash
        inPublished
        createdAt
        updatedAt
      }
      total
      page
      pageSize
      totalPages
    }
  }
`;