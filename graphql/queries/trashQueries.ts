import { gql } from '@apollo/client';

export const GET_TRASHED_PAGES = gql`
  query TrashedPages($workspaceId: Int!, $ownerId: Int) {
    trashedPages(workspaceId: $workspaceId, ownerId: $ownerId) {
      id
      title
      workspaceId
      ownerId
      trashedAt
      createdAt
      updatedAt
    }
  }
`;