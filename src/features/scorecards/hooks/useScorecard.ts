import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/shared/Toast/useToast';
import { supabase } from '@/lib/supabase';
import { Scorecard, Team } from '../types';
import { transformScores, transformTeamScores } from '../utils/scorecardTransformers';
import { fetchHoleInformation } from '../services/holeService';
import { handleError } from '../utils/errorHandling';
import { calculateHandicapStrokes } from '../utils/handicapCalculations';

export function useScorecard(scorecardId: string) {
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [scores, setScores] = useState<Record<string, Record<number, { gross: number | null; points: number | null; handicapStrokes: number; matchPlayStatus?: number }>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const loadScorecard = useCallback(async () => {
    if (!scorecardId) return;

    try {
      setIsLoading(true);
      
      // Fetch scorecard with course and player details
      const { data: scorecardData, error: scorecardError } = await supabase
        .from('scorecards')
        .select(`
          *,
          course:courses(
            id,
            name,
            holes
          ),
          players:scorecard_players(
            id,
            handicap,
            player:profiles(
              id,
              username,
              avatar_url,
              handicap
            ),
            team_id
          )
        `)
        .eq('id', scorecardId)
        .single();

      if (scorecardError) throw scorecardError;

      // Fetch hole information
      const holes = await fetchHoleInformation(scorecardData.course.id);

      // Determine if this is a team game
      const isTeamGame = scorecardData.game_type === 'scramble' || scorecardData.game_type === '4ball';

      let teams: Team[] = [];
      let scoreData;

      if (isTeamGame) {
        // Get unique team IDs
        const teamIds = [...new Set(
          scorecardData.players
            .filter((p: any) => p.team_id)
            .map((p: any) => p.team_id)
        )];
        
        if (teamIds.length > 0) {
          // Fetch teams data
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', teamIds);
            
          if (teamsError) throw teamsError;
          
          // Map teams with their players
          teams = teamsData.map(team => {
            const teamPlayers = scorecardData.players
              .filter((p: any) => p.team_id === team.id)
              .map((p: any) => ({
                id: p.player.id,
                username: p.player.username,
                avatarUrl: p.player.avatar_url,
                handicap: p.player.handicap,
                teamId: p.team_id
              }));
              
            return {
              id: team.id,
              name: team.name,
              players: teamPlayers,
              handicap: team.handicap || 0,
              totalGrossScore: team.total_gross_score,
              totalPoints: team.total_points,
              relativeScore: team.relative_score,
              completedHoles: team.completed_holes,
              matchPlayTotal: team.match_play_total
            };
          });

          // Fetch team scores
          const { data: teamScoreData, error: teamScoreError } = await supabase
            .from('scorecard_team_scores')
            .select('*')
            .eq('scorecard_id', scorecardId);

          if (teamScoreError) throw teamScoreError;
          
          // Transform team scores
          scoreData = transformTeamScores(teamScoreData || []);
        }
      } else {
        // Fetch individual player scores
        const { data: playerScoreData, error: scoresError } = await supabase
          .from('scorecard_scores')
          .select('*')
          .eq('scorecard_id', scorecardId);

        if (scoresError) throw scoresError;
        
        // Transform player scores
        scoreData = transformScores(playerScoreData || []);
      }

      // Initialize scores object
      const transformedScores = scoreData || {};
      
      // For team games, ensure all teams have scores for all holes
      if (isTeamGame && teams.length > 0) {
        teams.forEach(team => {
          // If team doesn't have scores yet, initialize them
          if (!transformedScores[team.id]) {
            transformedScores[team.id] = {};
          }
          
          // For each hole, ensure there's a score entry with handicap strokes
          holes.forEach(hole => {
            const holeNumber = hole.holeNumber;
            if (!transformedScores[team.id][holeNumber]) {
              const teamHandicapStrokes = calculateHandicapStrokes(team.handicap, hole.handicap);
              
              transformedScores[team.id][holeNumber] = {
                gross: null,
                points: null,
                handicapStrokes: teamHandicapStrokes,
                matchPlayStatus: 0
              };
            }
          });
        });
      }
      
      setScorecard({
        id: scorecardData.id,
        courseId: scorecardData.course.id,
        courseName: scorecardData.course.name,
        createdBy: scorecardData.created_by,
        date: new Date(scorecardData.date),
        weather: scorecardData.weather,
        gameType: scorecardData.game_type,
        createdAt: scorecardData.created_at,
        updatedAt: scorecardData.updated_at,
        completedAt: scorecardData.completed_at,
        players: scorecardData.players.map((p: any) => ({
          id: p.player.id,
          username: p.player.username,
          avatarUrl: p.player.avatar_url,
          handicap: p.handicap || p.player.handicap,
          teamId: p.team_id
        })),
        teams: teams.length > 0 ? teams : undefined,
        holes
      });
      setScores(transformedScores);
    } catch (error) {
      console.error('Error loading scorecard:', error);
      addToast('error', 'Failed to load scorecard');
    } finally {
      setIsLoading(false);
    }
  }, [scorecardId, addToast]);

  // Initial load
  useEffect(() => {
    loadScorecard();
  }, [loadScorecard]);

  // Set up real-time subscription for team scores
  useEffect(() => {
    if (!scorecardId) return;

    const channel = supabase
      .channel(`scorecard-team-scores-${scorecardId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scorecard_team_scores',
        filter: `scorecard_id=eq.${scorecardId}`
      }, () => {
        // Reload the entire scorecard to get fresh data
        loadScorecard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scorecardId, loadScorecard]);

  // Set up real-time subscription for teams
  useEffect(() => {
    if (!scorecardId || !scorecard?.teams) return;

    const teamIds = scorecard.teams.map(team => team.id);
    
    const channel = supabase
      .channel(`teams-${scorecardId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'teams',
        filter: `id=in.(${teamIds.join(',')})`
      }, () => {
        // Reload the entire scorecard to get fresh data
        loadScorecard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scorecardId, loadScorecard, scorecard?.teams]);

  const updateScore = async (playerId: string, holeNumber: number, score: number) => {
    if (!scorecard) return;
    
    try {
      // Check if this is a team game
      const isTeamGame = scorecard.gameType === 'scramble' || scorecard.gameType === '4ball';
      
      // Update local state immediately
      setScores(prevScores => {
        const playerScores = prevScores[playerId] || {};
        const currentHoleScore = playerScores[holeNumber] || { 
          gross: null, 
          points: null, 
          handicapStrokes: 0,
          matchPlayStatus: 0
        };
        
        return {
          ...prevScores,
          [playerId]: {
            ...playerScores,
            [holeNumber]: {
              ...currentHoleScore,
              gross: score
            }
          }
        };
      });

      if (isTeamGame) {
        // Update team score in database
        const { error } = await supabase
          .from('scorecard_team_scores')
          .upsert({ 
            scorecard_id: scorecardId,
            team_id: playerId, // For team games, playerId is actually teamId
            hole_number: holeNumber,
            gross_score: score
          }, {
            onConflict: 'scorecard_id,team_id,hole_number'
          });

        if (error) throw error;

        // Fetch updated score with points and match play status
        const { data: updatedScore } = await supabase
          .from('scorecard_team_scores')
          .select('points, handicap_strokes, match_play_status')
          .eq('scorecard_id', scorecardId)
          .eq('team_id', playerId)
          .eq('hole_number', holeNumber)
          .single();

        if (updatedScore) {
          setScores(prevScores => {
            const playerScores = prevScores[playerId] || {};
            return {
              ...prevScores,
              [playerId]: {
                ...playerScores,
                [holeNumber]: {
                  gross: score,
                  points: updatedScore.points,
                  handicapStrokes: updatedScore.handicap_strokes || 0,
                  matchPlayStatus: updatedScore.match_play_status
                }
              }
            };
          });
        }
      } else {
        // Update individual player score in database
        const { error } = await supabase
          .from('scorecard_scores')
          .upsert({ 
            scorecard_id: scorecardId,
            player_id: playerId,
            hole_number: holeNumber,
            gross_score: score
          }, {
            onConflict: 'scorecard_id,player_id,hole_number'
          });

        if (error) throw error;

        // Fetch updated score with points
        const { data: updatedScore } = await supabase
          .from('scorecard_scores')
          .select('points, handicap_strokes')
          .eq('scorecard_id', scorecardId)
          .eq('player_id', playerId)
          .eq('hole_number', holeNumber)
          .single();

        if (updatedScore) {
          setScores(prevScores => {
            const playerScores = prevScores[playerId] || {};
            return {
              ...prevScores,
              [playerId]: {
                ...playerScores,
                [holeNumber]: {
                  gross: score,
                  points: updatedScore.points,
                  handicapStrokes: updatedScore.handicap_strokes || 0
                }
              }
            };
          });
        }
      }
    } catch (error) {
      console.error('Error updating score:', error);
      addToast('error', 'Failed to update score');
      // Revert local state on error
      loadScorecard();
    }
  };

  return {
    scorecard,
    scores,
    isLoading,
    updateScore,
    refresh: loadScorecard
  };
}