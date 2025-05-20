import React from 'react';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import { Button } from '@/components/shared/Button';

interface SearchResult {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  friendStatus: 'none' | 'friends' | 'pending_sent' | 'pending_received';
}

interface UserSearchResultsProps {
  results: SearchResult[];
  onSendRequest: (userId: string) => void;
  isLoading?: boolean;
}

export function UserSearchResults({ results, onSendRequest, isLoading }: UserSearchResultsProps) {
  if (isLoading) {
    return (
      <div className="mt-2 bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
        Searching users...
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  const getActionButton = (result: SearchResult) => {
    switch (result.friendStatus) {
      case 'friends':
        return (
          <Button variant="secondary" disabled className="flex items-center gap-1.5 !py-1.5 !px-3 text-sm">
            <UserCheck className="w-4 h-4" />
            Friends
          </Button>
        );
      case 'pending_sent':
        return (
          <Button variant="secondary" disabled className="flex items-center gap-1.5 !py-1.5 !px-3 text-sm">
            <Clock className="w-4 h-4" />
            Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <Button variant="secondary" disabled className="flex items-center gap-1.5 !py-1.5 !px-3 text-sm text-accent">
            Check Requests
          </Button>
        );
      default:
        return (
          <Button
            onClick={() => onSendRequest(result.id)}
            variant="secondary"
            className="flex items-center gap-1.5 !py-1.5 !px-3 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </Button>
        );
    }
  };

  return (
    <div className="mt-2 bg-white rounded-lg shadow-sm divide-y">
      {results.map((result) => (
        <div
          key={result.id}
          className="flex items-center justify-between p-4"
        >
          <div className="flex items-center space-x-3">
            <img
              src={result.avatarUrl || 'https://via.placeholder.com/40'}
              alt={result.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span className="font-medium text-gray-900">
                {result.fullName || result.username}
              </span>
              {result.fullName && (
                <p className="text-sm text-gray-500">
                  @{result.username}
                </p>
              )}
            </div>
          </div>
          {getActionButton(result)}
        </div>
      ))}
    </div>
  );
}