import React from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/shared/Input';

interface Friend {
  id: string;
  username: string;
  avatarUrl: string;
  handicap: number;
}

export function FriendsList({ friends }: { friends: Friend[] }) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Friends</h2>
        <button className="text-accent hover:text-accent/80">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>
      
      <Input
        label="Search friends"
        icon={<Search className="w-5 h-5" />}
        placeholder="Search by name..."
        className="mb-4"
      />

      <div className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
            <img
              src={friend.avatarUrl}
              alt={friend.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900">{friend.username}</p>
              <p className="text-sm text-gray-600">Handicap: {friend.handicap}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}