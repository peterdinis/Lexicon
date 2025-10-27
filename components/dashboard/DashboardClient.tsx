"use client";

import { useState } from "react";
import { File, Folder } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Page {
  id: string;
  title?: string;
  description?: string;
}

interface FolderType {
  id: string;
  title?: string;
}

interface DashboardClientProps {
  pages: Page[];
  folders: FolderType[];
  itemsPerPage?: number;
}

export default function DashboardClient({
  pages,
  folders,
  itemsPerPage = 6,
}: DashboardClientProps) {
  const [pagesPage, setPagesPage] = useState(1);
  const [foldersPage, setFoldersPage] = useState(1);

  const pagesStart = (pagesPage - 1) * itemsPerPage;
  const foldersStart = (foldersPage - 1) * itemsPerPage;

  const pagesToShow = pages.slice(pagesStart, pagesStart + itemsPerPage);
  const foldersToShow = folders.slice(foldersStart, foldersStart + itemsPerPage);

  const totalPagesPages = Math.ceil(pages.length / itemsPerPage);
  const totalFoldersPages = Math.ceil(folders.length / itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
          <File className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-3">
          Welcome to Lexicon
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Select an existing page or folder to start writing.
        </p>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Your Folders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foldersToShow.map((folder) => (
              <Link
                key={folder.id}
                href={`/folder/${folder.id}`}
                className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors block"
              >
                <div className="flex items-center mb-2">
                  <Folder className="w-5 h-5 mr-2 text-neutral-500" />
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    {folder.title || "Unnamed Folder"}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* ShadCN UI Pagination */}
          {totalFoldersPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setFoldersPage(Math.max(1, foldersPage - 1))}
                    className={foldersPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalFoldersPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setFoldersPage(i + 1)}
                      isActive={foldersPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setFoldersPage(Math.min(totalFoldersPages, foldersPage + 1))}
                    className={foldersPage === totalFoldersPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Pages Section */}
      {pages.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Recent Pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagesToShow.map((page) => (
              <Link
                key={page.id}
                href={`/page/${page.id}`}
                className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors block"
              >
                <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                  {page.title || "Untitled"}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                  {page.description || "No description available"}
                </p>
              </Link>
            ))}
          </div>

          {/* ShadCN UI Pagination */}
          {totalPagesPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPagesPage(Math.max(1, pagesPage - 1))}
                    className={pagesPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPagesPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setPagesPage(i + 1)}
                      isActive={pagesPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPagesPage(Math.min(totalPagesPages, pagesPage + 1))}
                    className={pagesPage === totalPagesPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Ak nie sú žiadne pages ani folders */}
      {pages.length === 0 && folders.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            No pages or folders yet. Create your first one to get started!
          </p>
        </div>
      )}
    </div>
  );
}