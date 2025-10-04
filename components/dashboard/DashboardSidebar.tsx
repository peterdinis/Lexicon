"use client"

import { useLogout } from "@/hooks/auth/useLogout";
import { useUser } from "@/hooks/auth/useProfile";
import { FC } from "react";

// TODO: Later refactor

const DashboardSidebar: FC = () => {
  const { data: user, isLoading, error } = useUser();
  const logoutMutation = useLogout();

  if (isLoading) return <div>Loading user...</div>;
  if (error) return <div>Error loading user</div>;

  return (
    <div className="p-4 w-64 bg-gray-100 h-full">
      <h2 className="text-xl font-bold mb-4">Sidebar</h2>

      {user ? (
        <div>
          <p className="mb-2">Hello, {user.username}</p>
          <button
            onClick={() => logoutMutation.mutate()}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
};

export default DashboardSidebar;
