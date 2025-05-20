import React from 'react';

export function LoadingCourseCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200 animate-pulse" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        
        {/* Location */}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}