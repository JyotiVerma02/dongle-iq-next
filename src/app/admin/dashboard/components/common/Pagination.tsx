import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6 ud-surface ud-surface-glass rounded-b-xl" style={{ borderColor: "var(--border-soft)" }}>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
            Showing <span className="font-bold text-[var(--foreground)]">{totalItems === 0 ? 0 : startItem}</span> to <span className="font-bold text-[var(--foreground)]">{endItem}</span> of{" "}
            <span className="font-bold text-[var(--foreground)]">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[var(--muted)] ring-1 ring-inset ring-[var(--border-soft)] hover:bg-[var(--background-alt)] focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="relative inline-flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] ring-1 ring-inset ring-[var(--border-soft)] bg-[var(--background-alt)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-[var(--muted)] ring-1 ring-inset ring-[var(--border-soft)] hover:bg-[var(--background-alt)] focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      
      {/* Mobile pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border bg-[var(--card)] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] hover:bg-[var(--background-alt)] disabled:opacity-50"
          style={{ borderColor: "var(--border-soft)" }}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border bg-[var(--card)] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] hover:bg-[var(--background-alt)] disabled:opacity-50"
          style={{ borderColor: "var(--border-soft)" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
