import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  id,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`form-input ${error ? 'border-red-500 focus:ring-red-500 dark:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
