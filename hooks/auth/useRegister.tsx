"use client"

import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION } from "@/graphql/mutations/auth/authMutations";
import { toast } from "sonner";

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
