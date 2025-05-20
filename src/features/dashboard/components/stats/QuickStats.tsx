import React from 'react';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { useGolfStats } from '../../hooks/useGolfStats';

export function QuickStats() {
  const { stats, isLoading } = useGolfStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="ml-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Trophy,
      label: 'Best Score',
      value: stats.bestScore || '-',
      color: 'bg-gradient-to-br from-emerald-100 to-emerald-50'
    },
    {
      icon: Target,
      label: 'Handicap',
      value: stats.handicap?.toFixed(1) || '-',
      color: 'bg-gradient-to-br from-blue-100 to-blue-50'
    },
    {
      icon: Clock,
      label: 'Rounds Played',
      value: stats.roundsPlayed,
      color: 'bg-gradient-to-br from-purple-100 to-purple-50'
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: stats.averageScore || '-',
      color: 'bg-gradient-to-br from-pink-100 to-pink-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statItems.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}