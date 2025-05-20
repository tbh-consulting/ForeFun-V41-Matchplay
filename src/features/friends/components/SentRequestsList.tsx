import React from 'react';
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { FriendRequest } from '../types';

interface SentRequestsListProps {
  requests: FriendRequest[];
  onCancel: (requestId: string) => void;
  isLoading?: boolean;
}

export function SentRequestsList({
  requests,
  onCancel,
  isLoading
}: SentRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No pending sent requests
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
                src={request.receiver?.avatarUrl || 'https://via.placeholder.com/40'}
                alt={request.receiver?.username}
                className="w-10 h-10 rounded-full"
              />
              <Clock className="w-4 h-4 text-accent absolute -bottom-1 -right-1" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {request.receiver?.username}
              </p>
              <p className="text-sm text-gray-500">
                Request pending
              </p>
            </div>
          </div>
          <Button
            onClick={() => onCancel(request.id)}
            variant="secondary"
            className="!p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Cancel request"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      ))}
    </div>
  );
}