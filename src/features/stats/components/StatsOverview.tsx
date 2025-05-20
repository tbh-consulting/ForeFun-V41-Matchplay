import React from 'react';
import { useStats } from '../hooks/useStats';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';
import { Loader } from 'lucide-react';

interface StatsOverviewProps {
  userId?: string;
}

export function StatsOverview({ userId }: StatsOverviewProps) {
  const { stats, isLoading } = useStats(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const formatScore = (score: number | null) => {
    if (score === null) return '-';
    if (score === 0) return 'E';
    return score > 0 ? `+${score}` : score.toString();
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-900';
    if (score === 0) return 'text-gray-900';
    return score > 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        icon={Clock}
        label="Total Rounds"
        value={stats.totalRounds}
        description="Completed rounds"
        color="bg-gradient-to-br from-purple-100 to-purple-50"
        iconColor="text-purple-600"
      />
      
      <StatCard
        icon={TrendingUp}
        label="Average Score"
        value={formatScore(stats.averageScore)}
        description="Relative to par"
        color="bg-gradient-to-br from-blue-100 to-blue-50"
        iconColor="text-blue-600"
        valueColor={getScoreColor(stats.averageScore)}
      />
      
      <StatCard
        icon={Trophy}
        label="Best Score"
        value={formatScore(stats.bestScore)}
        description="Relative to par"
        color="bg-gradient-to-br from-emerald-100 to-emerald-50"
        iconColor="text-emerald-600"
        valueColor={getScoreColor(stats.bestScore)}
      />
      
      <StatCard
        icon={Target}
        label="Current Handicap"
        value={stats.handicap?.toFixed(1) || '-'}
        description="Official handicap"
        color="bg-gradient-to-br from-amber-100 to-amber-50"
        iconColor="text-amber-600"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  description: string;
  color: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  description,
  color,
  iconColor,
  valueColor = 'text-gray-900'
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
      </div>
      <div className="space-y-1">
        <p className={`text-2xl font-semibold ${valueColor}`}>
          {value}
        </p>
        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}