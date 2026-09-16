import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg sm:my-8 m-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <div className="flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
