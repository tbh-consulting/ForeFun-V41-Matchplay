import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { ToastProps } from './types';

export function Toast({ 
  type = 'info', 
  message, 
  onClose 
}: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const backgrounds = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50'
  };

  return (
    <div className={`${backgrounds[type]} p-4 rounded-lg shadow-lg max-w-sm w-full`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm text-gray-900">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-500 transition-colors duration-DEFAULT"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}