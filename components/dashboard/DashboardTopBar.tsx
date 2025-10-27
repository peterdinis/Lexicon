"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LogOut, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/supabase/client";
import { ModeToggle } from "../shared/ModeToggle";
import { Spinner } from "../ui/spinner";
import { FC, useState } from "react";

const supabase = getSupabaseBrowserClient();

const fetchUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("No user");
  return data.user;
};

const DashboardTopBar: FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Tu pridaj logiku pre vyhľadávanie
    console.log("Searching for:", searchQuery);
    // Napríklad: router.push(`/search?q=${searchQuery}`);
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
        <h1 className="text-lg font-semibold" />
        <div className="flex items-center gap-2">
          {/* Search Dialog */}
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Vyhľadávanie</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSearch}>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Input
                      placeholder="Zadajte hľadaný výraz..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button type="submit" size="sm" className="px-3">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Hľadať</span>
                  </Button>
                </div>
              </form>
              
              {/* Tu môžeš pridať výsledky vyhľadávania */}
              {/* <div className="mt-4">
                {searchResults && (
                  <div>
                    {searchResults.map((result) => (
                      <div key={result.id}>{result.title}</div>
                    ))}
                  </div>
                )}
              </div> */}
            </DialogContent>
          </Dialog>

          {/* User Dropdown */}
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