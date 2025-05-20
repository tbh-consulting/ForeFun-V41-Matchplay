import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { ScorecardList } from '../components/ScorecardList/ScorecardList';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { isSupabaseConfigured } from '@/lib/supabase';
import { ScorecardFilters as FilterType, defaultFilters } from '../types/filters';

export function ScorecardListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterType>(defaultFilters);

  if (!isSupabaseConfigured()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ConnectionRequired />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="container mx-auto mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scorecards</h1>
            <p className="text-xs sm:text-sm text-gray-500">Track and manage your golf rounds</p>
          </div>
          <Button
            onClick={() => navigate('/scorecards/new')}
            className="flex items-center gap-2 !py-2 sm:!py-3 !px-4 sm:!px-6 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="inline">New Round</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto">
        <ScorecardList filters={filters} />
      </div>
    </div>
  );
}