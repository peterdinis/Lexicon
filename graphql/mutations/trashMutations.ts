import { gql } from "@apollo/client";

export const MOVE_PAGE_TO_TRASH = gql`
  mutation MovePageToTrash($id: Int!) {
    movePageToTrash(id: $id) {
      id
      title
      trashedAt
    }
  }
`;

export const RESTORE_PAGE_FROM_TRASH = gql`
  mutation RestorePageFromTrash($id: Int!) {
    restorePageFromTrash(id: $id) {
      id
      title
      trashedAt
    }
  }
`;