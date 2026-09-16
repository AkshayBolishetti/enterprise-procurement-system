import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Check } from 'lucide-react';

export const FilterDropdown = ({ options, value, onChange, label = "Filter" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 rounded-[0.8rem] border border-[var(--input)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-sm"
      >
        <Filter className="w-4 h-4 text-[var(--muted)]" />
        {label}: <span className="font-semibold">{selectedOption ? selectedOption.label : 'All'}</span>
        <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl bg-[var(--card)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--input)] overflow-hidden">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  value === option.value
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                    : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                }`}
              >
                {option.label}
                {value === option.value && <Check className="w-4 h-4 text-[var(--primary)]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
