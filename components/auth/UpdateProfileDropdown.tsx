"use client";

import { useMe } from "@/hooks/auth/useMe";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

const Settings = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6" />
        <path d="M1 12h6m6 0h6" />
    </svg>
);

const LogOut = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);

interface DropdownMenuProps {
    children: ReactNode;
    trigger: ReactNode;
}

const DropdownMenu = ({ children, trigger }: DropdownMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleTriggerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div onClick={handleTriggerClick} className="cursor-pointer">
                {trigger}
            </div>
            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95 p-2"
                    role="menu"
                    aria-orientation="vertical"
                >
                    {children}
                </div>
            )}
        </div>
    );
};

interface DropdownMenuItemProps {
    children: ReactNode;
    onClick?: () => void;
}

const DropdownMenuItem = ({ children, onClick }: DropdownMenuItemProps) => (
    <a
        href="#"
        onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            if (onClick) onClick();
        }}
        className="text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
        role="menuitem"
    >
        {children}
    </a>
);

export default function ProfileDropdown() {
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
        <div className="flex items-center justify-center font-sans">
            <DropdownMenu
                trigger={
                    <Avatar>
                        <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(me?.name!)}`}
                        />
                        <AvatarFallback>{me && me?.name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                }
            >
                <div className="px-3 py-3 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center space-x-3">
                        <Avatar>
                        <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(me?.name!)}`}
                        />
                        <AvatarFallback>{me && me?.name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                        <div>
                            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {me?.name}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {me?.email}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-1">
                    <DropdownMenuItem onClick={() => console.log("Profile")}>
                        <Settings className="mr-3 h-4 w-4 text-zinc-500" />
                        <Link href="/settings">Go To Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-3 h-4 w-4 text-zinc-500" />
                        Logout
                    </DropdownMenuItem>
                </div>
            </DropdownMenu>
        </div>
    );
}
