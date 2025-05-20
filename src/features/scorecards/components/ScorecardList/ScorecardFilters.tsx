import React from 'react';
import { Filter, SortAsc } from 'lucide-react';
import { Select } from '@/components/shared/Select';
import { ScorecardFilters as FilterType } from '../../types/filters';
import { GameTypeDisplay } from '../ScorecardDetails/GameTypeDisplay';

interface ScorecardFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
}

export function ScorecardFilters({ filters, onChange }: ScorecardFiltersProps) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">Filter by:</span>
        </div>

        <Select
          label=""
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as FilterType['status'] })}
          options={[
            { value: 'all', label: 'All Rounds' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' }
          ]}
          className="w-32 sm:w-40 text-xs sm:text-sm !py-1.5 sm:!py-2"
        />

        <Select
          label=""
          value={filters.timeframe}
          onChange={(e) => onChange({ ...filters, timeframe: e.target.value as FilterType['timeframe'] })}
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'year', label: 'This Year' }
          ]}
          className="w-32 sm:w-40 text-xs sm:text-sm !py-1.5 sm:!py-2"
        />

        <Select
          label=""
          value={filters.gameType || 'all'}
          onChange={(e) => onChange({ ...filters, gameType: e.target.value as FilterType['gameType'] })}
          options={[
            { value: 'all', label: 'All Game Types' },
            { value: 'strokeplay', label: 'Stroke Play' },
            { value: 'scramble', label: 'Scramble' }
          ]}
          className="w-32 sm:w-40 text-xs sm:text-sm !py-1.5 sm:!py-2"
        />

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <SortAsc className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
          <Select
            label=""
            value="date_desc"
            onChange={() => {}}
            options={[
              { value: 'date_desc', label: 'Newest First' },
              { value: 'date_asc', label: 'Oldest First' }
            ]}
            className="w-32 sm:w-40 text-xs sm:text-sm !py-1.5 sm:!py-2"
          />
        </div>
      </div>
    </div>
  );
}