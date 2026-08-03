import React from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

function TableStateRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-gray-500">
        {children}
      </td>
    </tr>
  );
}

function PagerButton({
  onClick,
  disabled,
  roundedClass,
  icon,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  roundedClass: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 ${roundedClass} hover:bg-gray-100 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
    >
      {icon}
      {children}
    </button>
  );
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Toolbar */}
      {onSearchChange && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 outline-none transition-colors"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-6 py-3 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableStateRow colSpan={columns.length}>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Loading data...
                </div>
              </TableStateRow>
            ) : data.length === 0 ? (
              <TableStateRow colSpan={columns.length}>No records found.</TableStateRow>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className={`bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <span className="text-sm text-gray-700">
            Showing page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </span>
          <div className="inline-flex rounded-md shadow-sm">
            <PagerButton
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              roundedClass="rounded-l-lg"
              icon={<ChevronLeft className="w-4 h-4 mr-1" />}
            >
              Prev
            </PagerButton>
            <PagerButton
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              roundedClass="rounded-r-lg border-l-0"
              icon={null}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </PagerButton>
          </div>
        </div>
      )}
    </div>
  );
}
