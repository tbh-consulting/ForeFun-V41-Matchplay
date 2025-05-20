import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      if (label.includes('Score')) {
        if (value === 0) return 'E';
        return value > 0 ? `+${value}` : value;
      }
    }
    return value;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-full`}>
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{formatValue(value)}</p>
        </div>
      </div>
    </div>
  );
}