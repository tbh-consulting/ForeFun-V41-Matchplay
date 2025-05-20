import { useState } from 'react';
import { useToast } from '@/components/shared/Toast/useToast';
import { supabase } from '@/lib/supabase';
import { WeatherCondition, GameType } from '../types';
import { validatePlayerId } from '../utils/playerValidation';

interface UpdateData {
  weather?: WeatherCondition;
  players?: string[];
  gameType?: GameType;
  teams?: {
    name: string;
    playerIds: string[];
  }[];
}

export function useUpdateScorecard(scorecardId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const updateScorecard = async (data: UpdateData) => {
    try {
      setIsLoading(true);

      if (data.weather) {
        const { error } = await supabase
          .from('scorecards')
          .update({ weather: data.weather })
          .eq('id', scorecardId);

        if (error) throw error;
      }

      if (data.gameType) {
        const { error } = await supabase
          .from('scorecards')
          .update({ game_type: data.gameType })
          .eq('id', scorecardId);

        if (error) throw error;
      }

      if (data.players?.length) {
        // Validate player IDs
        const validPlayerIds = data.players.filter(validatePlayerId);
        
        if (validPlayerIds.length === 0) {
          throw new Error('No valid player IDs provided');
        }

        // Get players' handicaps
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, handicap')
          .in('id', validPlayerIds);

        if (profilesError) throw profilesError;

        // Insert players with their current handicaps
        const { error } = await supabase
          .from('scorecard_players')
          .insert(
            profiles.map(profile => ({
              scorecard_id: scorecardId,
              player_id: profile.id,
              handicap: profile.handicap // Store current handicap
            }))
          );

        if (error) {
          // Check if error is due to duplicate players
          if (error.code === '23505') { // Unique violation
            throw new Error('One or more players are already added to this scorecard');
          }
          throw error;
        }
      }

      // Handle team creation if teams are provided
      if (data.teams && data.teams.length > 0) {
        // Create teams
        for (const team of data.teams) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .insert({
              name: team.name,
              created_by: (await supabase.auth.getUser()).data.user?.id,
              member_1: team.playerIds[0] || null,
              member_2: team.playerIds[1] || null,
              member_3: team.playerIds.length > 2 ? team.playerIds[2] : null,
              member_4: team.playerIds.length > 3 ? team.playerIds[3] : null
            })
            .select('id')
            .single();

          if (teamError) throw teamError;

          // Update players with team ID
          for (const playerId of team.playerIds) {
            const { error: updateError } = await supabase
              .from('scorecard_players')
              .update({ team_id: teamData.id })
              .eq('scorecard_id', scorecardId)
              .eq('player_id', playerId);

            if (updateError) throw updateError;
          }
        }
      }

      addToast('success', 'Scorecard updated successfully');
    } catch (error) {
      console.error('Error updating scorecard:', error);
      addToast('error', error instanceof Error ? error.message : 'Failed to update scorecard');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateScorecard,
    isLoading
  };
}