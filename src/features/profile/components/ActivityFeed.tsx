import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CircleDot, Award } from 'lucide-react';

interface Activity {
  id: string;
  type: 'round' | 'achievement';
  title: string;
  date: Date;
  details: string;
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-accent/10 rounded-full">
                {activity.type === 'round' ? (
                  <CircleDot className="w-5 h-5 text-accent" />
                ) : (
                  <Award className="w-5 h-5 text-accent" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.details}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(activity.date, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}