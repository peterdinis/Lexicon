"use client";

import { useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ME_QUERY } from "@/graphql/queries/auth/authQueries";
import { useMe } from "@/hooks/auth/useMe";

const ProfileDropdown: FC = () => {
	const { me, loading } = useMe();
	const router = useRouter();

	const logout = () => {
		localStorage.removeItem("token");
		router.push("/auth");
	};

	if (loading) {
		return <Loader2 className="animate-spin w-8 h-8" />;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Avatar>
					<AvatarImage
						src={`https://ui-avatars.com/api/?name=${encodeURIComponent(me?.name!)}`}
					/>
					<AvatarFallback>{me && me?.name?.[0]?.toUpperCase()}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>
					<div className="flex flex-col">
						<span>{me && me?.name}</span>
						<span className="text-xs text-muted-foreground">
							{me && me?.email}
						</span>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={logout} className="text-red-600">
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileDropdown;
