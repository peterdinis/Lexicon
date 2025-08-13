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

const ProfileDropdown: FC = () => {
	const { data, loading } = useQuery(ME_QUERY);
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
						src={`https://ui-avatars.com/api/?name=${encodeURIComponent(data?.me && data?.me?.name)}`}
					/>
					<AvatarFallback>
						{data?.me && data?.me?.name?.[0]?.toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>
					<div className="flex flex-col">
						<span>{data?.me && data?.me?.name}</span>
						<span className="text-xs text-muted-foreground">
							{data?.me && data?.me?.email}
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
