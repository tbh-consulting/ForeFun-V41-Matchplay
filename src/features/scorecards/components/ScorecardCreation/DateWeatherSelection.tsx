import React, { useState } from 'react';
import { Calendar, Cloud, CloudRain, Sun, Wind } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { WeatherCondition } from '../../types';

interface DateWeatherSelectionProps {
  onSubmit: (data: { date: Date; weather: WeatherCondition }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function DateWeatherSelection({
  onSubmit,
  onBack,
  isLoading
}: DateWeatherSelectionProps) {
  // Initialize with current date and default weather
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition>('sunny');

  const weatherOptions: { value: WeatherCondition; label: string; icon: React.ReactNode }[] = [
    { value: 'sunny', label: 'Sunny', icon: <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: 'cloudy', label: 'Cloudy', icon: <Cloud className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: 'partly_cloudy', label: 'Partly Cloudy', icon: <Cloud className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: 'rainy', label: 'Rainy', icon: <CloudRain className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: 'windy', label: 'Windy', icon: <Wind className="w-5 h-5 sm:w-6 sm:h-6" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: selectedDate,
      weather: selectedWeather
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent"
            required
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Weather Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Weather Conditions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {weatherOptions.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedWeather(value)}
              className={`
                flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 transition-all text-xs sm:text-sm
                ${selectedWeather === value
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-gray-200 hover:border-accent/30'
                }
              `}
            >
              {icon}
              <span className="mt-1 sm:mt-2">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2 sm:pt-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onBack}
          className="!py-2 !px-4 text-xs sm:text-sm"
        >
          Back
        </Button>
        <Button 
          type="submit" 
          isLoading={isLoading}
          className="!py-2 !px-4 text-xs sm:text-sm"
        >
          Create Scorecard
        </Button>
      </div>
    </form>
  );
}