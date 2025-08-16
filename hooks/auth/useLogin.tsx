"use client"

import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "@/graphql/mutations/auth/authMutations";
import { toast } from "sonner";

export const useLogin = () => {
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted(data) {
      toast.success("Logged in successfully!");
      localStorage.setItem("token", data.login);
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const login = (email: string, password: string) => {
    return loginMutation({
      variables: { data: { email, password } },
    });
  };

  return { login, loading };
};
