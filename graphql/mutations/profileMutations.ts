import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
	mutation UpdateProfile($data: UpdateUserInput!) {
		updateProfile(data: $data) {
			id
			name
			lastName
			email
			photoUrl
		}
	}
`;

export const DELETE_PROFILE = gql`
	mutation DeleteProfile {
		deleteProfile
	}
`;
