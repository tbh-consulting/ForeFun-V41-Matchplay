import React from 'react';
import { UserPlus, X, Check } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { FriendRequest } from '../types';

interface FriendRequestListProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export function FriendRequestList({
  requests,
  onAccept,
  onReject,
}: FriendRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={request.sender?.avatarUrl || 'https://via.placeholder.com/40'}
                alt={request.sender?.username}
                className="w-10 h-10 rounded-full"
              />
              <UserPlus className="w-4 h-4 text-accent absolute -bottom-1 -right-1" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {request.sender?.username}
              </p>
              <p className="text-sm text-gray-500">
                Sent you a friend request
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onAccept(request.id)}
              variant="secondary"
              className="!p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Accept request"
            >
              <Check className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => onReject(request.id)}
              variant="secondary"
              className="!p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Decline request"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}