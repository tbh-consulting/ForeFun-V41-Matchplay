import React from 'react';
import { ArrowUpDown, SortAsc, SortDesc, Text, Clock } from 'lucide-react';
import { CourseSortOption } from '../../types';

interface CourseSortProps {
  sort: CourseSortOption;
  onSort: (sort: CourseSortOption) => void;
}

export function CourseSort({ sort, onSort }: CourseSortProps) {
  const sortOptions = [
    { label: 'Name', field: 'name', icon: Text },
    { label: 'Recently Added', field: 'created_at', icon: Clock }
  ] as const;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="flex items-center text-gray-600">
        <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
        <span className="text-xs sm:text-sm font-medium hidden xs:inline">Sort by</span>
      </div>
      <div className="flex gap-1 sm:gap-2">
        {sortOptions.map(({ label, field, icon: Icon }) => (
          <button
            key={field}
            onClick={() => onSort({
              field,
              direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
            })}
            className={`
              inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors
              ${sort.field === field 
                ? 'bg-accent text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
            <span className="hidden xs:inline">{label}</span>
            {sort.field === field && (
              <span className="ml-1">
                {sort.direction === 'asc' 
                  ? <SortAsc className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  : <SortDesc className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                }
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}