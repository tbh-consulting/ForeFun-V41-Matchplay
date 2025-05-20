import React from 'react';
import { Users, User } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { GameType } from '../../types';

interface GameTypeSelectionProps {
  selectedGameType: GameType;
  onSelect: (gameType: GameType) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function GameTypeSelection({
  selectedGameType,
  onSelect,
  onBack,
  isLoading
}: GameTypeSelectionProps) {
  const gameTypes: { value: GameType; label: string; icon: React.ReactNode }[] = [
    { 
      value: 'strokeplay', 
      label: 'Stroke Play', 
      icon: <User className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    { 
      value: 'scramble', 
      label: 'Scramble', 
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />
    }
  ] as const;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Select Game Type</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {gameTypes.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            disabled={isLoading}
            className={`
              flex items-center p-4 sm:p-6 rounded-lg border-2 transition-all
              ${selectedGameType === value
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-gray-200 hover:border-accent/30'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className={`
              p-2 rounded-full mr-4
              ${selectedGameType === value ? 'bg-accent/10' : 'bg-gray-100'}
            `}>
              {icon}
            </div>
            <h4 className="font-medium text-base sm:text-lg">{label}</h4>
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      {onBack && (
        <div className="flex justify-between pt-4">
          <Button 
            variant="secondary" 
            onClick={onBack}
            className="!py-2 !px-4 text-sm"
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      )}
    </div>
  );
}