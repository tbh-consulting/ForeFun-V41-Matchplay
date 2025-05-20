import React from 'react';
import { Loader } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  isLoading = false, 
  children, 
  disabled,
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = "px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base";
  
  const variants = {
    primary: "bg-gradient-to-r from-accent to-accent/90 text-white shadow-lg hover:shadow-xl focus:ring-accent/50",
    secondary: "bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow focus:ring-gray-500/50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Loader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-2" />
          Loading...
        </span>
      ) : children}
    </button>
  );
}