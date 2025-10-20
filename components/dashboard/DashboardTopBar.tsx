"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/supabase/client";
import { ModeToggle } from "../shared/ModeToggle";
import { Spinner } from "../ui/spinner";

const supabase = getSupabaseBrowserClient();

const fetchUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("No user");
  return data.user;
};

const DashboardTopBar = () => {
  const router = useRouter();
  const {
    data: user,
    error,
    mutate,
  } = useSWR("user", fetchUser, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  if (error) {
    router.push("/auth/login");
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    mutate(null, false);
    router.push("/auth/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-14">
        <Spinner />
      </div>
    );
  }

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
