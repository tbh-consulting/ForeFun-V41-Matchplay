import { supabase } from '@/lib/supabase';
import { handleError } from '../utils/errorHandling';

interface PlayerProfile {
  handicap: number | null;
}

export async function getPlayerProfile(playerId: string): Promise<PlayerProfile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('handicap')
      .eq('id', playerId)
      .single();

    if (error) {
      throw handleError(error, 'Failed to fetch player profile');
    }

    return data;
  } catch (error) {
    throw handleError(error, 'Failed to fetch player profile');
  }
}

export async function addPlayerToScorecard(
  scorecardId: string,
  playerId: string,
  handicap: number | null
) {
  try {
    const { error } = await supabase
      .from('scorecard_players')
      .insert({
        scorecard_id: scorecardId,
        player_id: playerId,
        handicap
      });

    if (error) {
      throw handleError(error, 'Failed to add player to scorecard');
    }
  } catch (error) {
    throw handleError(error, 'Failed to add player to scorecard');
  }
}