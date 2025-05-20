import React from 'react';
import { ActivityFeed } from '../components/ActivityFeed';

export function ActivityFeedPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Activity Feed</h1>
      <ActivityFeed />
    </div>
  );
}