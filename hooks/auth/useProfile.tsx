"use client";

import { useMutation } from "@apollo/client";
import {
	DELETE_PROFILE,
	UPDATE_PROFILE,
} from "@/graphql/mutations/auth/profileMutations";

export type ProfileFormData = {
	name: string;
	lastName?: string;
	photoUrl?: string;
};

export const useProfileMutations = () => {
	const [updateProfileMutation] = useMutation(UPDATE_PROFILE, {
		refetchQueries: ["Me"],
	});

	const [deleteProfileMutation] = useMutation(DELETE_PROFILE);

	const updateProfile = async (data: ProfileFormData) => {
		return updateProfileMutation({ variables: { data } });
	};

	const deleteProfile = async () => {
		return deleteProfileMutation();
	};

	return {
		updateProfile,
		deleteProfile,
	};
};
