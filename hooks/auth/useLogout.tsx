"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter()

  return useMutation({
    mutationKey: ["userLogout"],
    mutationFn: async () => {
      localStorage.removeItem('jwtToken');
      return true;
    },
    onSuccess: () => {
      queryClient.removeQueries(
        {
            queryKey: ["currentUser"]
        }
      );
      router.push("/login")
    },
  });
};