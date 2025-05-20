import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Flag, ClipboardList, Users, Star } from 'lucide-react';
import { Activity } from '../types';
import { Link } from 'react-router-dom';

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityContent = () => {
    switch (activity.type) {
      case 'course_created':
        return {
          icon: <Flag className="w-5 h-5 text-accent" />,
          content: (
            <>
              Added new course{' '}
              <Link to={`/courses/${activity.data.courseId}`} className="text-accent hover:text-accent/80">
                {activity.data.courseName}
              </Link>
            </>
          )
        };
      case 'scorecard_created':
        return {
          icon: <ClipboardList className="w-5 h-5 text-accent" />,
          content: (
            <>
              Started a new round at{' '}
              <Link to={`/scorecards/${activity.data.scorecardId}`} className="text-accent hover:text-accent/80">
                {activity.data.courseName}
              </Link>
            </>
          )
        };
      case 'friend_added':
        return {
          icon: <Users className="w-5 h-5 text-accent" />,
          content: (
            <>
              Became friends with{' '}
              <span className="font-medium">{activity.data.friendName}</span>
            </>
          )
        };
      case 'course_reviewed':
        return {
          icon: <Star className="w-5 h-5 text-accent" />,
          content: (
            <>
              Reviewed{' '}
              <Link to={`/courses/${activity.data.courseId}`} className="text-accent hover:text-accent/80">
                {activity.data.courseName}
              </Link>
              {' '}with {activity.data.rating} stars
            </>
          )
        };
      default:
        return null;
    }
  };

  const content = getActivityContent();
  if (!content) return null;

  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-2 bg-accent/5 rounded-full">
        {content.icon}
      </div>
      <div className="flex-1">
        <div className="text-gray-600">
          {content.content}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}