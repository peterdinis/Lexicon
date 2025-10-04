import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useLogout = () => {
  const queryClient = useQueryClient();

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
    },
  });
};