"use client";

import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { REGISTER_MUTATION } from "@/graphql/mutations/auth/authMutations";

export const useRegister = () => {
	const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION, {
		onCompleted(data) {
			toast.success("Registered successfully!");
			localStorage.setItem("token", data.register);
		},
		onError(error) {
			toast.error(error.message);
		},
	});

	const register = (name: string, email: string, password: string) => {
		return registerMutation({
			variables: { data: { name, email, password } },
		});
	};

	return { register, loading };
};
