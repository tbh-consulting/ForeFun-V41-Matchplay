import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: Option[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ 
  label, 
  options, 
  error, 
  className = '', 
  id,
  ...props 
}, ref) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      <label 
        htmlFor={selectId}
        className="block text-xs sm:text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border rounded-lg shadow-sm appearance-none
            text-xs sm:text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-500' : 'border-gray-200'}
            ${className}
          `}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';