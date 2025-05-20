import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MapPin, Clock, Trophy, Users } from 'lucide-react';
import { FriendActivity } from '../../types';
import { useLikes } from '@/features/scorecards/hooks/useLikes';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { GameTypeDisplay } from '@/features/scorecards/components/ScorecardDetails/GameTypeDisplay';

interface FriendActivityItemProps {
  activity: FriendActivity;
}

export function FriendActivityItem({ activity }: FriendActivityItemProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { likes, hasLiked, toggleLike } = useLikes(activity.scorecardId);

  const formatRelativeScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '-';
    if (score === 0) return 'E';
    return score > 0 ? `+${score}` : score.toString();
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'text-gray-500';
    if (score === 0) return 'text-gray-900';
    return score > 0 ? 'text-red-600' : 'text-green-600';
  };

  const formatMatchPlayScore = (total?: number) => {
    if (total === undefined) return null;
    if (total === 0) return "AS";
    
    if (total > 0) {
      return total === 1 ? "1U" : `${total}U`;
    } else {
      const absValue = Math.abs(total);
      return absValue === 1 ? "1D" : `${absValue}D`;
    }
  };

  const getMatchPlayColor = (total?: number) => {
    if (total === undefined) return 'text-gray-500';
    if (total === 0) return 'text-gray-500';
    return total > 0 ? 'text-green-600' : 'text-red-600';
  };

  const isTeamGame = activity.gameType === 'scramble' || activity.gameType === '4ball';

  const handleActivityClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on social interaction elements
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      e.stopPropagation();
      return;
    }
    navigate(`/scorecards/${activity.scorecardId}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activity.isTeam) {
      navigate(`/profile/${activity.user.id}`);
    }
  };

  // Truncate course name to a maximum of 15 characters
  const truncateCourseName = (name: string) => {
    return name.length > 15 ? name.substring(0, 15) + '...' : name;
  };

  // Truncate timestamp to just show the time unit
  const truncateTimestamp = (timestamp: string) => {
    const fullTimestamp = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    // Extract just the number and time unit (e.g., "13 hours" from "about 13 hours ago")
    const match = fullTimestamp.match(/(\d+\s\w+)/);
    return match ? match[0] : fullTimestamp;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
      {/* Activity Header */}
      <div 
        className="p-3 cursor-pointer"
        onClick={handleActivityClick}
      >
        <div className="flex items-start gap-2">
          {activity.isTeam ? (
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-accent" />
            </div>
          ) : (
            <img
              src={activity.user.avatarUrl || DEFAULT_AVATAR}
              alt={activity.user.username}
              className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-accent transition-all object-cover flex-shrink-0"
              onClick={handleUserClick}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = DEFAULT_AVATAR;
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={handleUserClick}
                    className={`text-xs font-medium text-gray-900 hover:text-accent transition-colors truncate ${activity.isTeam ? 'cursor-default hover:text-gray-900' : ''}`}
                  >
                    {activity.isTeam ? activity.user.username : (activity.isOwnActivity ? 'You' : activity.user.username)}
                  </button>
                  {activity.gameType && (
                    <GameTypeDisplay gameType={activity.gameType as any} size="sm" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{truncateCourseName(activity.courseName)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>{activity.completedHoles} holes • {truncateTimestamp(activity.date)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 ml-2">
                {isTeamGame && activity.matchPlayTotal !== undefined ? (
                  <span className={`text-sm font-medium ${getMatchPlayColor(activity.matchPlayTotal)}`}>
                    {formatMatchPlayScore(activity.matchPlayTotal)}
                  </span>
                ) : (
                  <span className={`text-sm font-medium ${getScoreColor(activity.relativeScore)}`}>
                    {formatRelativeScore(activity.relativeScore)}
                  </span>
                )}
                {activity.points > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-blue-500">
                    <Trophy className="w-3 h-3" />
                    <span>{activity.points} pts</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Interactions */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike();
            }}
            className={`flex items-center gap-1 ${
              hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } transition-colors`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">{likes.length}</span>
          </button>
          <button
            onClick={() => navigate(`/scorecards/${activity.scorecardId}`)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="text-xs">{activity.comments.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
}