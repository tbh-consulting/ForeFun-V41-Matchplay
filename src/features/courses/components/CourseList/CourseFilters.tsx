import React from 'react';
import { Filter } from 'lucide-react';
import { CourseFilters as FilterType } from '../../types';

interface CourseFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
}

export function CourseFilters({ filters, onChange }: CourseFiltersProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <div className="flex items-center text-gray-600">
        <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
        <span className="text-xs sm:text-sm font-medium">Filter by</span>
      </div>
    </div>
  );
}