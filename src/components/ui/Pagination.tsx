import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-xl glass transition-all',
          currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/[0.08]'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-forge-muted">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'w-10 h-10 rounded-xl text-sm font-medium transition-all',
              currentPage === page
                ? 'bg-forge-blue/20 text-forge-blue border border-forge-blue/40 shadow-glow-sm'
                : 'glass text-forge-muted hover:text-white hover:bg-white/[0.06]'
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-xl glass transition-all',
          currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/[0.08]'
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}