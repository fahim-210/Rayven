import React from 'react';
import { cn } from '../../lib/utils.ts';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
}) => {
  if (totalPages <= 1 && !totalItems) return null;

  const pages: (number | 'ellipsis')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-neutral-400',
        className
      )}
    >
      {totalItems !== undefined && pageSize !== undefined && (
        <div>
          Showing{' '}
          <span className="font-semibold text-neutral-200">
            {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-neutral-200">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{' '}
          of <span className="font-semibold text-neutral-200">{totalItems}</span> records
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span key={`ell-${idx}`} className="px-2 text-neutral-600">
                ...
              </span>
            );
          }

          const isCurrent = p === currentPage;
          return (
            <button
              key={`pg-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                'min-w-[32px] h-8 px-2 rounded-md font-medium transition-all text-xs',
                isCurrent
                  ? 'bg-amber-400 text-black font-bold shadow-sm'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              )}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
