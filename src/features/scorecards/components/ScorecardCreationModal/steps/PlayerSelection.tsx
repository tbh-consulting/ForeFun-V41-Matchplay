import React from 'react';
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
  const [search, setSearch] = React.useState('');
  const { user } = useAuth();
  const { friends, isLoading } = useFriends();
  const [showFriendsList, setShowFriendsList] = React.useState(false);

  // Filter friends based on search
  const filteredFriends = friends.filter(friend => {
    const searchLower = search.toLowerCase();
    return (
      friend.sender?.username.toLowerCase().includes(searchLower) ||
      friend.receiver?.username.toLowerCase().includes(searchLower)
    );
  });

  // Get friend data for selected players
  const selectedPlayerData = selectedPlayers.map(playerId => {
    const friend = friends.find(f => 
      f.sender?.id === playerId || f.receiver?.id === playerId
    );
    return {
      id: playerId,
      username: friend?.sender?.username || friend?.receiver?.username || '',
      avatarUrl: friend?.sender?.avatarUrl || friend?.receiver?.avatarUrl
    };
  });

  const handleAddPlayer = (playerId: string) => {
    if (selectedPlayers.length >= 5) return; // Max 6 players including user
    onSelect([...selectedPlayers, playerId]);
    setShowFriendsList(false);
  };

  const handleRemovePlayer = (playerId: string) => {
    onSelect(selectedPlayers.filter(id => id !== playerId));
  };

  return (
    <div className="space-y-4">
      {/* Selected Players */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Selected Players</h3>
        
        {/* Current User */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatarUrl || 'https://via.placeholder.com/40'}
              alt={user?.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{user?.username}</p>
              <p className="text-sm text-gray-500">You</p>
            </div>
          </div>
        </div>

        {/* Selected Friends */}
        {selectedPlayerData.map((player) => (
          <div key={player.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={player.avatarUrl || 'https://via.placeholder.com/40'}
                alt={player.username}
                className="w-8 h-8 rounded-full"
              />
              <p className="font-medium text-gray-900">{player.username}</p>
            </div>
            <button
              onClick={() => handleRemovePlayer(player.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}

        {/* Add Player Button */}
        {selectedPlayers.length < 5 && (
          <button
            onClick={() => setShowFriendsList(true)}
            className="w-full p-3 border-2 border-dashed rounded-lg text-gray-500 hover:text-accent hover:border-accent transition-colors"
          >
            <UserPlus className="w-5 h-5 mx-auto" />
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
            icon={<Search className="w-5 h-5" />}
            placeholder="Search by username..."
          />

          <div className="mt-2 max-h-[200px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading friends...</div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No friends found</div>
            ) : (
              filteredFriends.map((friend) => {
                const friendData = friend.sender_id === user?.id ? friend.receiver : friend.sender;
                if (!friendData || selectedPlayers.includes(friendData.id)) return null;

                return (
                  <button
                    key={friend.id}
                    onClick={() => handleAddPlayer(friendData.id)}
                    className="w-full flex items-center space-x-3 p-3 bg-white border rounded-lg hover:border-accent transition-colors"
                  >
                    <img
                      src={friendData.avatarUrl || 'https://via.placeholder.com/40'}
                      alt={friendData.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="font-medium text-gray-900">{friendData.username}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={() => onSelect(selectedPlayers)}
          disabled={selectedPlayers.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
}