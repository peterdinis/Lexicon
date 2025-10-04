"use client"

import { useQuery } from '@tanstack/react-query';

const fetchUser = async () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) throw new Error('No token found');

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export const useUser = () => {
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: fetchUser,
        retry: false,
        refetchOnWindowFocus: false,
    })
};
