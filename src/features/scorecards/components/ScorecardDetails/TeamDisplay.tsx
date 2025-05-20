import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Team } from '../../types';
import { supabase } from '@/lib/supabase';

interface TeamDisplayProps {
  team: Team;
}

export function TeamDisplay({ team }: TeamDisplayProps) {
  const [updatedTeam, setUpdatedTeam] = useState<Team>(team);

  // Set up real-time subscription for team updates
  useEffect(() => {
    const channel = supabase
      .channel(`team-${team.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teams',
        filter: `id=eq.${team.id}`
      }, async (payload) => {
        // Fetch the latest team data
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', team.id)
          .single();
        
        if (!error && data) {
          setUpdatedTeam({
            ...team,
            handicap: data.handicap,
            totalGrossScore: data.total_gross_score,
            totalPoints: data.total_points,
            relativeScore: data.relative_score,
            completedHoles: data.completed_holes,
            matchPlayTotal: data.match_play_total
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team.id]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-accent/10 rounded-full">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{updatedTeam.name}</h3>
          <p className="text-sm text-gray-500">
            Team Handicap: {updatedTeam.handicap !== undefined && updatedTeam.handicap !== null ? updatedTeam.handicap : 0}
          </p>
          {/* Match Play status section removed */}
        </div>
      </div>
      
      <div className="space-y-2">
        {updatedTeam.players.map(player => (
          <div key={player.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {player.avatarUrl ? (
                <img 
                  src={player.avatarUrl} 
                  alt={player.username} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <Users className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{player.username}</p>
              {player.handicap !== undefined && player.handicap !== null && (
                <p className="text-xs text-gray-500">Handicap: {player.handicap}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}