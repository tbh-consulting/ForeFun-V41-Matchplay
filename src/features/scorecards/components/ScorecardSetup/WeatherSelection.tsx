import React from 'react';
import { Sun, Cloud, CloudRain, Wind } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { WeatherCondition } from '../../types';

interface WeatherSelectionProps {
  onSelect: (weather: WeatherCondition) => void;
  isLoading?: boolean;
}

export function WeatherSelection({ onSelect, isLoading }: WeatherSelectionProps) {
  const weatherOptions: { value: WeatherCondition; label: string; icon: React.ReactNode }[] = [
    { value: 'sunny', label: 'Sunny', icon: <Sun className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { value: 'cloudy', label: 'Cloudy', icon: <Cloud className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { value: 'partly_cloudy', label: 'Partly Cloudy', icon: <Cloud className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { value: 'rainy', label: 'Rainy', icon: <CloudRain className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { value: 'windy', label: 'Windy', icon: <Wind className="w-6 h-6 sm:w-8 sm:h-8" /> }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {weatherOptions.map(({ value, label, icon }) => (
        <Button
          key={value}
          variant="secondary"
          onClick={() => onSelect(value)}
          disabled={isLoading}
          className="flex flex-col items-center p-4 sm:p-6 h-auto text-xs sm:text-base"
        >
          {icon}
          <span className="mt-2">{label}</span>
        </Button>
      ))}
    </div>
  );
}