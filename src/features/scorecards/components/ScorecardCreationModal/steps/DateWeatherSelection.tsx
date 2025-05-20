import React from 'react';
import { Calendar, Cloud, CloudRain, Sun, Wind } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { WeatherCondition } from '../../../types';

interface DateWeatherSelectionProps {
  date?: Date;
  weather?: WeatherCondition;
  onSubmit: (data: { date: Date; weather: WeatherCondition }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function DateWeatherSelection({
  date = new Date(),
  weather = 'sunny',
  onSubmit,
  onBack,
  isLoading
}: DateWeatherSelectionProps) {
  const [selectedDate, setSelectedDate] = React.useState(date);
  const [selectedWeather, setSelectedWeather] = React.useState<WeatherCondition>(weather);

  const weatherOptions: { value: WeatherCondition; label: string; icon: React.ReactNode }[] = [
    { value: 'sunny', label: 'Sunny', icon: <Sun className="w-6 h-6" /> },
    { value: 'cloudy', label: 'Cloudy', icon: <Cloud className="w-6 h-6" /> },
    { value: 'partly_cloudy', label: 'Partly Cloudy', icon: <Cloud className="w-6 h-6" /> },
    { value: 'rainy', label: 'Rainy', icon: <CloudRain className="w-6 h-6" /> },
    { value: 'windy', label: 'Windy', icon: <Wind className="w-6 h-6" /> }
  ];

  const handleSubmit = () => {
    onSubmit({
      date: selectedDate,
      weather: selectedWeather
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Weather Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weather Conditions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {weatherOptions.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedWeather(value)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${selectedWeather === value
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-gray-200 hover:border-accent/30'
                }
              `}
            >
              {icon}
              <span className="mt-2 text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
        >
          Create Scorecard
        </Button>
      </div>
    </div>
  );
}