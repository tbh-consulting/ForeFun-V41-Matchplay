import React, { useState, useMemo } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface PlayerSelectionProps {
  selectedPlayers: string[];
  onSelect: (players: string[]) => void;
  onBack: () => void;
}

export function PlayerSelection({ selectedPlayers, onSelect, onBack }: PlayerSelectionProps) {
  const [search, setSearch] = useState('');
  const [showFriendsList, setShowFriendsList] = useState(false);
  const { user } = useAuth();
  const { friends, isLoading } = useFriends();

  // Filter available friends (not already selected)
  const availableFriends = useMemo(() => {
    if (!user) return [];
    
    return friends.filter(friend => {
      const friendId = friend.sender_id === user.id 
        ? friend.receiver_id 
        : friend.sender_id;
      return !selectedPlayers.includes(friendId);
    });
  }, [friends, selectedPlayers, user]);

  // Filter by search
  const filteredFriends = useMemo(() => {
    const searchLower = search.toLowerCase();
    return availableFriends.filter(friend => {
      const friendData = friend.sender_id === user?.id ? friend.receiver : friend.sender;
      return friendData?.username.toLowerCase().includes(searchLower);
    });
  }, [availableFriends, search, user?.id]);

  const handleAddPlayer = (friendId: string) => {
    if (!user || selectedPlayers.length >= 5) return;
    onSelect([...selectedPlayers, friendId]);
    setShowFriendsList(false);
  };

  const handleRemovePlayer = (playerId: string) => {
    onSelect(selectedPlayers.filter(id => id !== playerId));
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Selected Players */}
      <div className="space-y-2">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700">Selected Players</h3>
        
        {/* Current User (automatically added) */}
        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src={user.avatarUrl || 'https://via.placeholder.com/40'}
              alt={user.username}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
            />
            <div>
              <p className="font-medium text-xs sm:text-sm text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-500">You (Creator)</p>
            </div>
          </div>
        </div>

        {/* Selected Friends */}
        {selectedPlayers.map((playerId) => {
          const friend = friends.find(f => {
            const friendId = f.sender_id === user.id ? f.receiver_id : f.sender_id;
            return friendId === playerId;
          });
          const friendData = friend?.sender_id === user.id ? friend.receiver : friend.sender;
          
          if (!friendData) return null;

          return (
            <div key={playerId} className="flex items-center justify-between p-2 sm:p-3 bg-white border rounded-lg">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img
                  src={friendData.avatarUrl || 'https://via.placeholder.com/40'}
                  alt={friendData.username}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                />
                <p className="font-medium text-xs sm:text-sm text-gray-900">{friendData.username}</p>
              </div>
              <button
                onClick={() => handleRemovePlayer(playerId)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          );
        })}

        {/* Add Player Button */}
        {selectedPlayers.length < 5 && (
          <button
            onClick={() => setShowFriendsList(true)}
            className="w-full p-2 sm:p-3 border-2 border-dashed rounded-lg text-gray-500 hover:text-accent hover:border-accent transition-colors"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
          </button>
        )}
      </div>

      {/* Friends List */}
      {showFriendsList && (
        <div className="mt-4">
          <Input
            label="Search Friends"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
            placeholder="Search by username..."
            className="!py-2 text-xs sm:text-sm"
          />

          <div className="mt-2 max-h-[200px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500 text-xs sm:text-sm">Loading friends...</div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs sm:text-sm">No friends found</div>
            ) : (
              filteredFriends.map((friend) => {
                const friendData = friend.sender_id === user.id ? friend.receiver : friend.sender;
                if (!friendData) return null;

                return (
                  <button
                    key={friend.id}
                    onClick={() => handleAddPlayer(friendData.id)}
                    className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white border rounded-lg hover:border-accent transition-colors"
                  >
                    <img
                      src={friendData.avatarUrl || 'https://via.placeholder.com/40'}
                      alt={friendData.username}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                    />
                    <p className="font-medium text-xs sm:text-sm text-gray-900">{friendData.username}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="secondary" 
          onClick={onBack}
          className="!py-2 !px-4 text-xs sm:text-sm"
        >
          Back
        </Button>
        <Button 
          onClick={() => onSelect(selectedPlayers)}
          className="!py-2 !px-4 text-xs sm:text-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}