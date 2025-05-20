import React from 'react';
import { Calendar, Cloud, CloudRain, Sun, Wind } from 'lucide-react';
import { format } from 'date-fns';
import { WeatherCondition, GameType } from '../../types';
import { GameTypeDisplay } from './GameTypeDisplay';

interface ScorecardHeaderProps {
  courseName: string;
  date: Date;
  weather: WeatherCondition;
  gameType: GameType;
}

const weatherIcons: Record<WeatherCondition, React.ReactNode> = {
  sunny: <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />,
  cloudy: <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />,
  partly_cloudy: <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />,
  rainy: <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
  windy: <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
};

export function ScorecardHeader({ courseName, date, weather, gameType }: ScorecardHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-1">
            {courseName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-gray-600">
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{format(date, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {weatherIcons[weather]}
              <span className="text-xs sm:text-sm capitalize">{weather.replace('_', ' ')}</span>
            </div>
            <GameTypeDisplay gameType={gameType} />
          </div>
        </div>
      </div>
    </div>
  );
}