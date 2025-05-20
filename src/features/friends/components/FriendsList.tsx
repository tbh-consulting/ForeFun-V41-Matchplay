import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMinus, Search } from 'lucide-react';
import { FriendRequest } from '../types';
import { formatFriendshipDate } from '../utils/dateUtils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Input } from '@/components/shared/Input';
import { DEFAULT_AVATAR } from '@/lib/constants';

interface FriendsListProps {
  friends: FriendRequest[];
}

export function FriendsList({ friends }: FriendsListProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  if (!user) return null;

  const filteredFriends = friends.filter(friend => {
    const friendData = friend.sender_id === user.id ? friend.receiver : friend.sender;
    if (!friendData) return false;
    
    const searchLower = search.toLowerCase();
    return friendData.username.toLowerCase().includes(searchLower) ||
           friendData.full_name?.toLowerCase().includes(searchLower);
  });

  if (friends.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No friends yet. Try searching for users to add!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        label=""
        placeholder="Search friends..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="w-5 h-5" />}
      />

      <div className="space-y-4">
        {filteredFriends.map((friend) => {
          // Get the friend's data based on whether they're the sender or receiver
          const friendData = friend.sender_id === user.id ? friend.receiver : friend.sender;
          
          if (!friendData) return null;

          return (
            <div
              key={friend.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => navigate(`/profile/${friendData.id}`)}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={friendData.avatarUrl || DEFAULT_AVATAR}
                    alt={friendData.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 hover:text-accent transition-colors">
                    {friendData.full_name || friendData.username}
                  </p>
                  {friendData.full_name && (
                    <p className="text-sm text-gray-500">@{friendData.username}</p>
                  )}
                  <div className="text-sm space-x-2">
                    <span className="text-gray-500">
                      Friends since {formatFriendshipDate(friend.created_at)}
                    </span>
                    {friendData.handicap && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-accent">
                          HCP: {friendData.handicap}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                title="Remove friend"
              >
                <UserMinus className="w-5 h-5" />
              </button>
            </div>
          );
        })}

        {filteredFriends.length === 0 && search && (
          <div className="text-center py-4 text-gray-500">
            No friends found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}