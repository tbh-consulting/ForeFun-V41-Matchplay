import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { ScorecardPlayer } from '../../types';
import { supabase } from '@/lib/supabase';

interface PlayerScore {
  player: ScorecardPlayer & { isTeam?: boolean };
  total: number;
  points: number;
  matchPlayTotal?: number;
}

interface ScorecardSummaryProps {
  players: (ScorecardPlayer & { isTeam?: boolean })[];
  scores: Record<string, Record<number, { gross: number | null; points: number | null; matchPlayStatus?: number }>>;
  isTeamGame?: boolean;
}

export function ScorecardSummary({ players, scores, isTeamGame }: ScorecardSummaryProps) {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  
  // Calculate initial scores from props
  useEffect(() => {
    const initialScores = players.map(player => {
      const playerScores = scores[player.id] || {};
      return {
        player,
        total: Object.values(playerScores).reduce((sum, score) => sum + (score.gross || 0), 0),
        points: Object.values(playerScores).reduce((sum, score) => sum + (score.points || 0), 0),
        matchPlayTotal: isTeamGame ? 0 : undefined // Will be updated from DB for team games
      };
    }).sort((a, b) => a.total - b.total);
    
    setPlayerScores(initialScores);
  }, [players, scores]);

  // Set up real-time subscription for team updates
  useEffect(() => {
    if (!isTeamGame) return;

    const teamIds = players
      .filter(p => p.isTeam)
      .map(p => p.id);
    
    if (teamIds.length === 0) return;

    // Function to fetch and update all teams data
    const fetchAndUpdateAllTeams = async () => {
      console.log("Fetching fresh data for all teams:", teamIds);
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, total_gross_score, total_points, match_play_total')
        .in('id', teamIds);
      
      if (error) {
        console.error("Error fetching team data:", error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Fresh team data received:", data);
        
        setPlayerScores(prev => 
          prev.map(ps => {
            if (ps.player.isTeam) {
              const freshData = data.find(t => t.id === ps.player.id);
              if (freshData) {
                return {
                  ...ps,
                  total: freshData.total_gross_score,
                  points: freshData.total_points,
                  matchPlayTotal: freshData.match_play_total
                };
              }
            }
            return ps;
          }).sort((a, b) => a.total - b.total)
        );
      }
    };
    
    // Create subscription for teams table
    const teamsChannel = supabase
      .channel('team-updates-summary')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teams',
        filter: `id=in.(${teamIds.join(',')})`
      }, fetchAndUpdateAllTeams)
      .subscribe();
    
    // Create subscription for scorecard_team_scores table
    const scoresChannel = supabase
      .channel('team-scores-summary')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scorecard_team_scores',
        filter: `team_id=in.(${teamIds.join(',')})`
      }, fetchAndUpdateAllTeams)
      .subscribe();
    
    // Initial fetch
    fetchAndUpdateAllTeams();
    
    return () => {
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(scoresChannel);
    };
  }, [isTeamGame, players]);

  const getMatchPlayDisplay = (total?: number) => {
    if (total === undefined) return null;
    if (total === 0) return "AS";
    
    if (total > 0) {
      return total === 1 ? "1U" : `${total}U`;
    } else {
      const absValue = Math.abs(total);
      return absValue === 1 ? "1D" : `${absValue}D`;
    }
  };

  if (!playerScores.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Scores</h3>
      <div className="space-y-2">
        {playerScores.map(({ player, total, points, matchPlayTotal }, index) => (
          <div key={player.id} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {player.isTeam ? (
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-3 h-3 text-accent" />
                </div>
              ) : null}
              <span className="text-sm font-medium">{player.username}</span>
              {index === 0 && total > 0 && (
                <span className="text-yellow-500">🏆</span>
              )}
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="font-bold">{total}</span>
              {points > 0 && (
                <span className="text-xs text-blue-500">
                  {points} pts
                </span>
              )}
              {isTeamGame && matchPlayTotal !== undefined && (
                <span className={`text-xs font-medium ${
                  matchPlayTotal > 0 ? 'text-green-600' : 
                  matchPlayTotal < 0 ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  {getMatchPlayDisplay(matchPlayTotal)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}