import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  error
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useOnClickOutside(containerRef, () => setIsOpen(false));

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="options-list"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 bg-white border rounded-lg shadow-sm text-left cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            ${error ? 'border-red-500' : 'border-gray-200'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption?.label || 'Select country'}
            </span>
            <div className="flex items-center">
              {selectedOption && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
                  className="p-1 hover:bg-gray-100 rounded-full mr-1 cursor-pointer"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {isOpen && (
          <div 
            id="options-list"
            role="listbox"
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-9 pr-3 py-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 cursor-pointer
                    ${option.value === value ? 'bg-accent/5 text-accent' : 'text-gray-900'}
                  `}
                >
                  {option.label}
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-gray-500 text-center">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}