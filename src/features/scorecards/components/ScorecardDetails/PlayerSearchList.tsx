import React from 'react';
import { Button } from '@/components/shared/Button';
import { PlayerSearchResult } from '../../types/playerSearch';

interface PlayerSearchListProps {
  players: PlayerSearchResult[];
  onSelect: (playerId: string) => Promise<void>;
  isLoading: boolean;
  isSearching: boolean;
}

export function PlayerSearchList({ 
  players, 
  onSelect, 
  isLoading,
  isSearching 
}: PlayerSearchListProps) {
  if (isSearching) {
    return (
      <div className="text-center py-4 text-gray-500">
        Searching players...
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No players found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player) => (
        <div
          key={player.id}
          className="flex items-center justify-between p-3 bg-white border rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <img
              src={player.avatarUrl || 'https://via.placeholder.com/40'}
              alt={player.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">
                {player.fullName || player.username}
              </p>
              {player.fullName && (
                <p className="text-sm text-gray-500">
                  @{player.username}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => onSelect(player.id)}
            isLoading={isLoading}
            className="!py-1.5 !px-3"
          >
            Add
          </Button>
        </div>
      ))}
    </div>
  );
}