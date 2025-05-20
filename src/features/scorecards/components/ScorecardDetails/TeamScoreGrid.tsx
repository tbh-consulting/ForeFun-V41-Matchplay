import React, { useState, useEffect } from 'react';
import { CourseHole } from '@/features/courses/types';
import { Team } from '../../types';
import { ScoreTable } from './ScoreTable';
import { MobileScoreTable } from './MobileScoreTable';
import { calculateHandicapStrokes } from '../../utils/handicapCalculations';
import { supabase } from '@/lib/supabase';

interface TeamScoreGridProps {
  holes: CourseHole[];
  teams: Team[];
  scores: Record<string, Record<number, { 
    gross: number | null; 
    points: number | null; 
    handicapStrokes: number;
    matchPlayStatus?: number;
  }>>;
  onScoreChange: (teamId: string, holeNumber: number, score: number) => void;
  isCreator: boolean;
  isCompleted: boolean;
  currentUserId?: string;
}

export function TeamScoreGrid({
  holes,
  teams,
  scores,
  onScoreChange,
  isCreator,
  isCompleted,
  currentUserId
}: TeamScoreGridProps) {
  // Split holes into front 9 and back 9
  const frontNine = holes.filter(h => h.holeNumber <= 9);
  const backNine = holes.filter(h => h.holeNumber > 9);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedTeams, setUpdatedTeams] = useState<Team[]>(teams);

  // Determine if current user is in a team
  const getUserTeam = () => {
    return teams.find(team => 
      team.players.some(player => player.id === currentUserId)
    );
  };

  const currentUserTeam = getUserTeam();

  // Set up real-time subscription to team updates
  useEffect(() => {
    const channel = supabase
      .channel('team-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teams',
        filter: teams.map(team => `id=eq.${team.id}`).join(',')
      }, () => {
        // Fetch updated team data
        const fetchUpdatedTeams = async () => {
          const { data, error } = await supabase
            .from('teams')
            .select('*')
            .in('id', teams.map(team => team.id));
          
          if (!error && data) {
            // Update the teams with fresh data
            const updatedTeamData = teams.map(team => {
              const freshData = data.find(t => t.id === team.id);
              if (freshData) {
                return {
                  ...team,
                  matchPlayTotal: freshData.match_play_total,
                  totalGrossScore: freshData.total_gross_score,
                  totalPoints: freshData.total_points,
                  relativeScore: freshData.relative_score,
                  completedHoles: freshData.completed_holes
                };
              }
              return team;
            });
            setUpdatedTeams(updatedTeamData);
            setRefreshKey(prev => prev + 1);
          }
        };
        
        fetchUpdatedTeams();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teams]);

  // Initialize scores for teams if they don't exist
  useEffect(() => {
    // For each team, ensure scores exist for all holes
    teams.forEach(team => {
      if (!scores[team.id]) {
        const teamScores: Record<number, { gross: number | null; points: number | null; handicapStrokes: number }> = {};
        
        // For each hole, calculate handicap strokes based on team handicap
        holes.forEach(hole => {
          const holeNumber = hole.holeNumber;
          const teamHandicapStrokes = calculateHandicapStrokes(team.handicap, hole.handicap);
          
          teamScores[holeNumber] = {
            gross: null,
            points: null,
            handicapStrokes: teamHandicapStrokes
          };
        });
      }
    });
  }, [teams, holes, scores]);

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col gap-8">
        {/* Front Nine */}
        <ScoreTable
          key={`front-${refreshKey}`}
          title="Front Nine"
          holes={frontNine}
          players={updatedTeams.map(team => ({
            id: team.id,
            username: team.name,
            handicap: team.handicap,
            isTeam: true
          }))}
          scores={scores}
          onScoreChange={onScoreChange}
          isCreator={isCreator}
          isCompleted={isCompleted}
          currentPlayerId={currentUserTeam?.id}
          isTeamGame={true}
        />

        {/* Back Nine */}
        {backNine.length > 0 && (
          <ScoreTable
            key={`back-${refreshKey}`}
            title="Back Nine"
            holes={backNine}
            players={updatedTeams.map(team => ({
              id: team.id,
              username: team.name,
              handicap: team.handicap,
              isTeam: true
            }))}
            scores={scores}
            onScoreChange={onScoreChange}
            isCreator={isCreator}
            isCompleted={isCompleted}
            currentPlayerId={currentUserTeam?.id}
            isTeamGame={true}
          />
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileScoreTable
          key={`mobile-${refreshKey}`}
          holes={holes}
          players={updatedTeams.map(team => ({
            id: team.id,
            username: team.name,
            handicap: team.handicap,
            isTeam: true
          }))}
          scores={scores}
          onScoreChange={onScoreChange}
          isCreator={isCreator}
          isCompleted={isCompleted}
          currentPlayerId={currentUserTeam?.id}
        />
      </div>
    </div>
  );
}