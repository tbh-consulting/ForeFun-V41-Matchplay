import React from 'react';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';

interface Stats {
  bestScore: number;
  handicap: number;
  roundsPlayed: number;
  averageScore: number;
}

export function StatsOverview({ stats }: { stats: Stats }) {
  const statItems = [
    { icon: Trophy, label: 'Best Score', value: stats.bestScore },
    { icon: Target, label: 'Handicap', value: stats.handicap },
    { icon: Clock, label: 'Rounds Played', value: stats.roundsPlayed },
    { icon: TrendingUp, label: 'Average Score', value: stats.averageScore },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {statItems.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent/10 rounded-full">
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