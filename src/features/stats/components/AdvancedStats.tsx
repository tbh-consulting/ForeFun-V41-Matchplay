import React from 'react';
import { useAdvancedStats } from '../hooks/useAdvancedStats';
import { Target, Flag, TrendingUp, Info } from 'lucide-react';

interface AdvancedStatsProps {
  userId?: string;
}

export function AdvancedStats({ userId }: AdvancedStatsProps) {
  const { stats, isLoading } = useAdvancedStats(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatScore = (score: number | null) => {
    if (score === null) return '-';
    return score.toFixed(1);
  };

  const getScoreColor = (score: number | null, par: number) => {
    if (score === null) return 'text-gray-900';
    const diff = score - par;
    if (diff === 0) return 'text-gray-900';
    return diff > 0 ? 'text-red-600' : 'text-green-600';
  };

  const scoringTypes = [
    { key: 'holeInOne', label: 'Hole in One', color: 'bg-purple-50 text-purple-600' },
    { key: 'albatross', label: 'Albatross', color: 'bg-indigo-50 text-indigo-600' },
    { key: 'eagle', label: 'Eagle', color: 'bg-blue-50 text-blue-600' },
    { key: 'birdie', label: 'Birdie', color: 'bg-green-50 text-green-600' },
    { key: 'par', label: 'Par', color: 'bg-gray-50 text-gray-600' },
    { key: 'bogey', label: 'Bogey', color: 'bg-yellow-50 text-yellow-600' },
    { key: 'double', label: 'Double Bogey', color: 'bg-orange-50 text-orange-600' },
    { key: 'triple', label: 'Triple Bogey', color: 'bg-red-50 text-red-600' },
    { key: 'other', label: 'Worse', color: 'bg-rose-50 text-rose-600' }
  ] as const;

  return (
    <div className="space-y-8">
      {/* Scoring Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Scoring Distribution</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {scoringTypes.map(({ key, label, color }) => (
            <div key={key} className={`${color} rounded-lg p-4 text-center`}>
              <div className="text-sm font-medium mb-1">{label}</div>
              <div className="text-2xl font-bold">{stats.distribution[key]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Par Type Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Flag className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Performance by Par</h3>
          <div className="group relative ml-auto">
            <Info className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute right-0 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
              <p className="mb-2">
                The percentage shows your improvement compared to your previous rounds:
              </p>
              <ul className="space-y-1 list-disc pl-4">
                <li>↓ Green percentage means better scoring (lower is better)</li>
                <li>↑ Red percentage means higher scoring (needs improvement)</li>
                <li>Based on your last 20 holes vs previous holes</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[3, 4, 5].map(par => (
            <div key={par} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Par {par}</span>
                <span className={`text-lg font-semibold ${getScoreColor(stats.parPerformance[par]?.average, par)}`}>
                  {formatScore(stats.parPerformance[par]?.average)}
                </span>
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Played: {stats.parPerformance[par]?.count || 0}</span>
                {stats.parPerformance[par]?.improvement !== undefined && (
                  <div className="flex items-center gap-1">
                    <span 
                      className={stats.parPerformance[par]?.improvement > 0 ? 'text-green-600' : 'text-red-600'}
                      title={`${Math.abs(stats.parPerformance[par]?.improvement || 0).toFixed(1)}% ${
                        stats.parPerformance[par]?.improvement > 0 ? 'better' : 'worse'
                      } than your previous rounds`}
                    >
                      {stats.parPerformance[par]?.improvement > 0 ? '↓' : '↑'} 
                      {Math.abs(stats.parPerformance[par]?.improvement || 0).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Handicap Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Handicap Information</h3>
          <div className="group relative ml-auto">
            <Info className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute right-0 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
              <p className="mb-2">
                Your handicap is calculated in two ways:
              </p>
              <ul className="space-y-1 list-disc pl-4 mb-2">
                <li>Official: Your registered handicap in the system</li>
                <li>Calculated: Based on your best 8 of last 20 rounds</li>
              </ul>
              <p className="mb-2">
                The calculated handicap uses a 0.96 multiplier to:
              </p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Account for course rating differences</li>
                <li>Reflect potential rather than average ability</li>
                <li>Provide a small buffer between scratch and non-scratch golfers</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Official Handicap</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.handicap?.current?.toFixed(1) || '-'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {stats.handicap?.lastUpdated ? 
                new Date(stats.handicap.lastUpdated).toLocaleDateString() : 
                'Never'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Calculated Handicap</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.handicap?.calculated?.toFixed(1) || '-'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Based on best 8 of last 20 rounds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}