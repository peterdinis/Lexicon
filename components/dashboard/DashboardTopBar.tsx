"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LogOut, User, Search, FileText, CheckSquare, Calendar, Network, Folder, Square, File } from "lucide-react";
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
import { FC, useState, useEffect } from "react";
import { SearchResult } from "@/actions/searchActions";
import { useSearch } from "@/hooks/use-search";

const supabase = getSupabaseBrowserClient();

const fetchUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("No user");
  return data.user;
};

// SearchResultItem komponent
const SearchResultItem: FC<{ result: SearchResult; onSelect: () => void }> = ({ 
  result, 
  onSelect 
}) => {
  const router = useRouter();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="h-4 w-4" />;
      case 'todo': return <CheckSquare className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'diagram': return <Network className="h-4 w-4" />;
      case 'folder': return <Folder className="h-4 w-4" />;
      case 'block': return <Square className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'page': return 'Stránka';
      case 'todo': return 'Úloha';
      case 'event': return 'Udalosť';
      case 'diagram': return 'Diagram';
      case 'folder': return 'Priečinok';
      case 'block': return 'Blok';
      default: return type;
    }
  };

  const handleClick = () => {
    router.push(result.url as any);
    onSelect();
  };

  return (
    <div
      className="flex items-start p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
      onClick={handleClick}
    >
      <div className="shrink-0 mt-0.5 mr-3 text-muted-foreground">
        {getIcon(result.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">{result.title}</p>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize shrink-0">
            {getTypeLabel(result.type)}
          </span>
        </div>
        {result.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {result.description}
          </p>
        )}
        {result.content && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {result.content}
          </p>
        )}
        {result.metadata?.created_at && (
          <p className="text-xs text-muted-foreground mt-1">
            Vytvorené: {new Date(result.metadata.created_at).toLocaleDateString('sk-SK')}
          </p>
        )}
      </div>
    </div>
  );
};

const DashboardTopBar: FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { search, results, loading, error } = useSearch();
  
  const {
    data: user,
    error: userError,
    mutate,
  } = useSWR("user", fetchUser, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length >= 2 && isSearchOpen) {
      const timeoutId = setTimeout(() => {
        search(searchQuery, ["pages", "todos", "events", "diagrams", "folders"], 10);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, isSearchOpen, search]);

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  if (userError) {
    router.push("/auth/login");
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    mutate(null, false);
    router.push("/auth/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      search(searchQuery, ["pages", "todos", "events", "diagrams", "folders"], 10, true);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleResultSelect = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
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
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Vyhľadávanie</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSearchSubmit}>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Input
                      placeholder="Hľadať stránky, úlohy, udalosti, diagramy..."
                      value={searchQuery}
                      onChange={(e) => handleInputChange(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="px-3" 
                    disabled={loading || searchQuery.trim().length < 2}
                  >
                    {loading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    <span className="sr-only">Hľadať</span>
                  </Button>
                </div>
              </form>
              
              {/* Výsledky vyhľadávania */}
              <div className="mt-4 max-h-96 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <Spinner className="h-5 w-5" />
                    <span className="ml-2 text-sm">Vyhľadávam...</span>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-4 text-destructive">
                    <p>Chyba pri vyhľadávaní</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                )}
                
                {!loading && results.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Nájdených {results.length} výsledkov
                    </p>
                    {results.map((result) => (
                      <SearchResultItem 
                        key={`${result.type}-${result.id}`} 
                        result={result} 
                        onSelect={handleResultSelect}
                      />
                    ))}
                  </div>
                )}
                
                {!loading && searchQuery.length > 0 && results.length === 0 && searchQuery.length >= 2 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenašli sa žiadne výsledky pre "{searchQuery}"</p>
                    <p className="text-sm mt-1">Skúste iný výraz alebo hľadajte v iných kategóriách</p>
                  </div>
                )}
                
                {searchQuery.length === 1 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Zadajte aspoň 2 znaky pre vyhľadávanie
                  </div>
                )}
                
                {!loading && searchQuery.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Zadajte hľadaný výraz</p>
                    <p className="text-sm mt-1">Vyhľadávať môžete v stránkach, úlohách, udalostiach, diagramoch a priečinkoch</p>
                  </div>
                )}
              </div>
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