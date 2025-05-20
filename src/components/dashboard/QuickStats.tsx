import React from 'react';
import { Trophy, Target, Clock } from 'lucide-react';

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full">
            <Trophy className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Best Score</p>
            <p className="text-2xl font-semibold text-gray-900">72</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Handicap</p>
            <p className="text-2xl font-semibold text-gray-900">14.2</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Rounds Played</p>
            <p className="text-2xl font-semibold text-gray-900">24</p>
          </div>
        </div>
      </div>
    </div>
  );
}