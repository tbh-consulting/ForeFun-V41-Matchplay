import React from 'react';
import { Target, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useGolfStats } from '@/features/dashboard/hooks/useGolfStats';

export function StatsSection() {
  const { stats, isLoading } = useGolfStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-200 rounded" />
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${color} rounded-full`}>
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-lg font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}