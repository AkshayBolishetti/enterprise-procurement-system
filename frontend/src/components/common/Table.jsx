import React from 'react';
import { Loader2 } from 'lucide-react';

export function Table({ 
  columns, 
  data, 
  isLoading, 
  emptyMessage = 'No records found.' 
}) {
  return (
    <div className="w-full overflow-hidden rounded-[1rem] border border-[var(--input)] bg-[var(--card)] shadow-[0_2px_20px_rgba(0,0,0,0.02)] dark:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--card)] border-b border-[var(--input)]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-5 font-semibold text-[var(--secondary-foreground)] uppercase text-xs tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--input)]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[var(--muted)]">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                    <p>Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[var(--secondary)] transition-colors bg-[var(--card)]">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-5 text-[var(--foreground)]">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[var(--muted)]">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
