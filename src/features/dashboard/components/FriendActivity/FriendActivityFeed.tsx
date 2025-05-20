import React from 'react';
import { Users, Loader } from 'lucide-react';
import { useFriendActivity } from '../../hooks/useFriendActivity';
import { FriendActivityItem } from './FriendActivityItem';
import { Button } from '@/components/shared/Button';

export function FriendActivityFeed() {
  const { activities, isLoading, hasMore, loadMore } = useFriendActivity();

  if (isLoading && activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gray-900">Friend Activity</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gray-900">Friend Activity</h2>
        </div>
        <p className="text-gray-500 text-center py-4">
          No recent activity from friends
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-gray-900">Friend Activity</h2>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <FriendActivityItem key={activity.id} activity={activity} />
        ))}
        
        {hasMore && (
          <div className="pt-2">
            <Button
              variant="secondary"
              onClick={loadMore}
              isLoading={isLoading}
              className="w-full"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}