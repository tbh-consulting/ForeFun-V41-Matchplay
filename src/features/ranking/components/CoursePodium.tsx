import React from 'react';
import { Trophy, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CourseRanking } from '../types';
import { formatRelativeScore } from '../utils/scoreFormatting';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface CoursePodiumProps {
  courseRanking: CourseRanking;
}

export function CoursePodium({ courseRanking }: CoursePodiumProps) {
  const { courseName, rankings, userRanking } = courseRanking;
  const [first, second, third] = rankings;
  const navigate = useNavigate();
  const { user } = useAuth();

  const renderPlayer = (player: typeof first | undefined, position: number) => {
    const getStyles = () => {
      switch (position) {
        case 1:
          return {
            container: '-mt-4 z-10',
            image: 'w-8 h-8 border-2 border-yellow-400 shadow-lg',
            badge: 'bg-yellow-400',
            podium: 'h-20 bg-gradient-to-t from-yellow-100 to-yellow-50 border-t-2 border-yellow-400',
            text: 'font-bold text-gray-900',
            score: 'font-medium text-yellow-600'
          };
        case 2:
          return {
            container: '',
            image: 'w-7 h-7 border border-gray-300 shadow',
            badge: 'bg-gray-400',
            podium: 'h-16 bg-gradient-to-t from-gray-100 to-gray-50 border-t border-gray-200',
            text: 'font-medium text-gray-700',
            score: 'text-gray-500'
          };
        case 3:
          return {
            container: '',
            image: 'w-7 h-7 border border-[#CD7F32] shadow',
            badge: 'bg-[#CD7F32]',
            podium: 'h-14 bg-gradient-to-t from-orange-50 to-white border-t border-orange-200',
            text: 'font-medium text-gray-700',
            score: 'text-gray-500'
          };
      };
    };

    const styles = getStyles();

    return (
      <div className={`flex flex-col items-center flex-1 ${styles.container}`}>
        {position === 1 && (
          <Trophy className="w-4 h-4 text-yellow-400 mb-1" />
        )}
        <div className="relative mb-1">
          {player ? (
            <button
              onClick={() => navigate(`/scorecards/${player.scorecardId}`)}
              className="group relative"
            >
              <img
                src={player.avatarUrl || 'https://via.placeholder.com/32'}
                alt={player.username}
                className={`rounded-full object-cover transition-transform group-hover:scale-105 ${styles.image}`}
              />
              <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          ) : (
            <div className={`rounded-full bg-gray-100 flex items-center justify-center ${styles.image}`}>
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${styles.badge} rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
            {position}
          </div>
        </div>
        <div className={`text-[11px] ${styles.text} text-center line-clamp-1 w-full px-1`} title={player?.username || 'Empty position'}>
          {player?.username || '---'}
        </div>
        <div className={`text-[11px] ${styles.score}`}>
          {player ? formatRelativeScore(player.relativeScore) : '---'}
        </div>
        <div className={`w-full ${styles.podium} rounded-t-lg mt-1`} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 break-words" title={courseName}>
          {courseName}
        </h3>
      </div>
      
      <div className="p-4 pt-16 flex-1 flex flex-col">
        <div className="relative flex items-end justify-center gap-2 w-full h-[100px]">
          {renderPlayer(second, 2)}
          {renderPlayer(first, 1)}
          {renderPlayer(third, 3)}
        </div>

        {/* User's position if not in top 3 */}
        {userRanking && user && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={userRanking.avatarUrl || 'https://via.placeholder.com/24'}
                  alt={userRanking.username}
                  className="w-6 h-6 rounded-full border border-gray-200"
                />
                <span className="text-sm text-gray-600">Your Position</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  #{userRanking.position}
                </span>
                <span className="text-sm text-gray-600">
                  ({formatRelativeScore(userRanking.relativeScore)})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}