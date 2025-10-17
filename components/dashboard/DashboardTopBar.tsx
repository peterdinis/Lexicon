"use client";

import { useRouter } from "next/navigation";
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
import { FC } from "react";
import { getSupabaseBrowserClient } from "@/supabase/client";
import { ModeToggle } from "../shared/ModeToggle";
import useSWR from "swr";
import { fetchUser } from "@/actions/authActions";

const supabase = getSupabaseBrowserClient();

const DashboardTopBar: FC = () => {
  const router = useRouter();

  const {
    data: user,
    error,
    mutate,
  } = useSWR(() => "user", fetchUser, {
    revalidateOnFocus: true,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    mutate(undefined, false);
    router.push("/auth/login");
    router.refresh();
  };

  if (error) return <div>Error loading user</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-semibold" />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuTrigger asChild>
              <ModeToggle />
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
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
