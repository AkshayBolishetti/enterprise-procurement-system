import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export const DataTable = ({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchable = true,
  searchableColumns = [],
  pagination = true,
  itemsPerPage = 10,
  emptyMessage = 'No records found.',
  toolbarChildren
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);

  // Sorting
  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Filtering
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return sortedData;
    const lowerQuery = searchQuery.toLowerCase();
    
    return sortedData.filter(item => {
      const keysToSearch = searchableColumns.length > 0 ? searchableColumns : Object.keys(item);
      
      return keysToSearch.some(key => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lowerQuery);
      });
    });
  }, [sortedData, searchQuery, searchableColumns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = pagination 
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredData;

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      // Third click removes sort (optional behavior, sticking to asc/desc toggle for now per instructions)
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full">
      {/* Header Actions */}
      {(searchable || toolbarChildren) && (
        <div className="py-4 shrink-0 flex items-center justify-between gap-4">
          {searchable ? (
            <div className="relative max-w-sm flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--background)] border border-[var(--input)] rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all"
              />
            </div>
          ) : <div />}
          
          {toolbarChildren && (
            <div className="flex-shrink-0">
              {toolbarChildren}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[var(--muted)] font-medium sticky top-0 z-10 border-b border-[var(--input)]">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index}
                  className={`px-6 py-4 whitespace-nowrap uppercase text-xs tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:bg-[var(--secondary)] transition-colors' : ''} ${col.align === 'right' ? 'text-right' : ''}`}
                  onClick={() => col.sortable !== false && col.key ? handleSort(col.key) : null}
                >
                  <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    {col.header}
                    {col.sortable !== false && col.key && (
                      <ArrowUpDown className="w-3.5 h-3.5 text-[var(--muted)] opacity-50 hover:opacity-100" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--input)]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-[var(--muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-base font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-[var(--secondary)] transition-colors group">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-5 text-[var(--foreground)] ${col.align === 'right' ? 'text-right' : ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 0 && (
        <div className="py-4 border-t border-[var(--input)] flex items-center justify-between shrink-0">
          <span className="text-sm text-[var(--secondary-foreground)] font-medium">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[var(--input)] bg-[var(--background)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--foreground)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-[var(--foreground)] min-w-[3rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[var(--input)] bg-[var(--background)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--foreground)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
