import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1 sm:space-y-2">
        <label 
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border rounded-lg shadow-sm
              transition-all duration-200 text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
              disabled:bg-gray-50 disabled:text-gray-500
              ${error ? 'border-red-500' : 'border-gray-200'}
              ${icon ? 'pl-8 sm:pl-10' : ''}
              ${className}
            `}
            {...props}
          />
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}
        </div>
        {error && (
          <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';