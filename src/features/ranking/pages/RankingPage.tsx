import React, { useState, useMemo } from 'react';
import { useRankings } from '../hooks/useRankings';
import { CoursePodium } from '../components/CoursePodium';
import { Loader, Trophy, Search, Users, Globe } from 'lucide-react';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Input } from '@/components/shared/Input';

export function RankingPage() {
  const [friendsOnly, setFriendsOnly] = useState(true);
  const { rankings, isLoading } = useRankings(friendsOnly);
  const [search, setSearch] = useState('');

  const filteredRankings = useMemo(() => {
    if (!search.trim()) return rankings;
    
    const searchLower = search.toLowerCase();
    return rankings.filter(ranking => 
      ranking.courseName.toLowerCase().includes(searchLower)
    );
  }, [rankings, search]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ConnectionRequired />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold text-gray-900">Course Rankings</h1>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="flex rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setFriendsOnly(true)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
                ${friendsOnly
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
                border-y border-l border-gray-200
                rounded-l-lg
              `}
            >
              <Users className="w-4 h-4" />
              Friends
            </button>
            <button
              onClick={() => setFriendsOnly(false)}
              className={`
                flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
                ${!friendsOnly
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
                border border-gray-200
                rounded-r-lg
                ${!friendsOnly ? 'border-accent' : ''}
              `}
            >
              <Globe className="w-4 h-4" />
              All
            </button>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-8">
        <Input
          label=""
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : filteredRankings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {filteredRankings.map((courseRanking) => (
            <CoursePodium
              key={courseRanking.courseId}
              courseRanking={courseRanking}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {search.trim() 
              ? 'No courses found matching your search' 
              : friendsOnly 
                ? 'No rankings available for your friends yet'
                : 'No rankings available yet'
            }
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {search.trim() 
              ? 'Try a different search term'
              : friendsOnly
                ? 'Complete some rounds with your friends to see rankings'
                : 'Complete some rounds to see rankings'
            }
          </p>
        </div>
      )}
    </div>
  );
}