import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-black/5"
        style={{ color: 'var(--text-primary)' }}
        aria-label="Previous page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      {/* Page 1 */}
      <button
        onClick={() => onPageChange(1)}
        className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-[13px] font-medium transition-colors ${
          currentPage === 1 ? 'bg-black text-white' : 'hover:bg-black/5'
        }`}
        style={currentPage === 1 ? {} : { color: 'var(--text-secondary)' }}
      >
        1
      </button>

      {/* Page 2 */}
      {totalPages >= 2 && (
        <button
          onClick={() => onPageChange(2)}
          className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-[13px] font-medium transition-colors ${
            currentPage === 2 ? 'bg-black text-white' : 'hover:bg-black/5'
          }`}
          style={currentPage === 2 ? {} : { color: 'var(--text-secondary)' }}
        >
          2
        </button>
      )}

      {/* Page 3 */}
      {totalPages >= 3 && (
        <button
          onClick={() => onPageChange(3)}
          className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-[13px] font-medium transition-colors ${
            currentPage === 3 ? 'bg-black text-white' : 'hover:bg-black/5'
          }`}
          style={currentPage === 3 ? {} : { color: 'var(--text-secondary)' }}
        >
          3
        </button>
      )}

      {/* Ellipsis */}
      {totalPages > 4 && (
        <span className="w-8 h-8 flex items-center justify-center font-sans text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          ...
        </span>
      )}

      {/* Last Page */}
      {totalPages >= 4 && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-[13px] font-medium transition-colors ${
            currentPage === totalPages ? 'bg-black text-white' : 'hover:bg-black/5'
          }`}
          style={currentPage === totalPages ? {} : { color: 'var(--text-secondary)' }}
        >
          {totalPages}
        </button>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-black/5"
        style={{ color: 'var(--text-primary)' }}
        aria-label="Next page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
};
