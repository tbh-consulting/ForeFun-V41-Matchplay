import React from 'react';
import { Loader } from 'lucide-react';
import { ActivityItem } from './ActivityItem';
import { useActivities } from '../hooks/useActivities';

export function ActivityFeed() {
  const { activities, isLoading } = useActivities();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activities yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}