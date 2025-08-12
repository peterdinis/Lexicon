"use client";

import { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/graphql/queries/authQueries";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ProfileDropdown: FC = () => {
  const { data, loading, error } = useQuery(ME_QUERY);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  if (loading) {
    return <Loader2 className="animate-spin w-8 h-8" />
  }

  if (error || !data?.me) {
    return null; 
  }

  const { name, email } = data.me;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`} />
          <AvatarFallback>{name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{name}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/billing")}>Billing</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/team")}>Team</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/subscription")}>Subscription</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
