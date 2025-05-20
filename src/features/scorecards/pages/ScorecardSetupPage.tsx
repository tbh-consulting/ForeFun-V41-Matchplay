import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { WeatherSelection } from '../components/ScorecardSetup/WeatherSelection';
import { PlayerSelection } from '../components/ScorecardSetup/PlayerSelection';
import { TeamFormation } from '../components/ScorecardSetup/TeamFormation';
import { useUpdateScorecard } from '../hooks/useUpdateScorecard';
import { useScorecard } from '../hooks/useScorecard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { Player, Team } from '../types';
import { supabase } from '@/lib/supabase';

type SetupStep = 'weather' | 'players' | 'teams';

export function ScorecardSetupPage() {
  const { scorecardId } = useParams<{ scorecardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends } = useFriends();
  const [step, setStep] = useState<SetupStep>('weather');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerObjects, setPlayerObjects] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const { updateScorecard, isLoading: isUpdating } = useUpdateScorecard(scorecardId!);
  const { scorecard, isLoading: isLoadingScorecard } = useScorecard(scorecardId!);
  const [creatorHandicap, setCreatorHandicap] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the creator's handicap directly from the database
  useEffect(() => {
    if (!user) return;

    async function fetchCreatorHandicap() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('handicap')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching creator handicap:', error);
          return;
        }
        
        if (data) {
          setCreatorHandicap(data.handicap);
        }
      } catch (error) {
        console.error('Error in handicap fetch:', error);
      }
    }

    fetchCreatorHandicap();
  }, [user]);

  // Convert selected player IDs to player objects with usernames and handicaps
  useEffect(() => {
    if (!user) return;
    
    const players: Player[] = [];
    
    // Add the current user first with their handicap from DB
    players.push({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      // Use the handicap from the direct DB fetch if available
      handicap: creatorHandicap !== null ? creatorHandicap : 
                (user.handicap !== undefined && user.handicap !== null) ? 
                  (typeof user.handicap === 'string' ? parseFloat(user.handicap) : user.handicap) : 
                  0
    });

    // Add selected friends
    selectedPlayers.forEach(playerId => {
      // Skip if this is the current user (already added)
      if (playerId === user.id) return;
      
      // Find the friend in the friends list
      const friend = friends.find(f => {
        const friendId = f.sender_id === user.id ? f.receiver_id : f.sender_id;
        return friendId === playerId;
      });

      const friendData = friend?.sender_id === user.id ? friend.receiver : friend.sender;
      
      if (friendData) {
        players.push({
          id: playerId,
          username: friendData.username,
          avatarUrl: friendData.avatarUrl,
          // Ensure handicap is a number or null, not undefined or string
          handicap: friendData.handicap !== undefined && friendData.handicap !== null
            ? typeof friendData.handicap === 'string'
              ? parseFloat(friendData.handicap)
              : friendData.handicap
            : null
        });
      }
    });

    setPlayerObjects(players);
  }, [user, friends, selectedPlayers, creatorHandicap]);

  const handleBack = () => {
    if (step === 'weather') {
      navigate('/scorecards');
    } else if (step === 'players') {
      setStep('weather');
    } else if (step === 'teams') {
      setStep('players');
    }
  };

  const handleWeatherSelect = async (weather: string) => {
    await updateScorecard({ weather });
    setStep('players');
  };

  const handlePlayersSelect = async (players: string[]) => {
    setSelectedPlayers(players);
    
    // Update the scorecard with the selected players
    await updateScorecard({ players });
    
    // If this is a team game, go to team formation step
    if (scorecard?.gameType === 'scramble') {
      setStep('teams');
    } else {
      // For individual games, proceed directly to the scorecard
      navigate(`/scorecards/${scorecardId}`);
    }
  };

  const handleTeamsSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Format teams for the API
      const formattedTeams = teams.map(team => ({
        name: team.name,
        playerIds: team.players.map(p => p.id),
        handicap: team.handicap
      }));

      // Create a new team scorecard with the selected teams
      const { data, error } = await supabase.rpc('create_team_scorecard', {
        p_course_id: scorecard?.courseId,
        p_created_by: user?.id,
        p_date: scorecard?.date.toISOString(),
        p_weather: scorecard?.weather,
        p_game_type: scorecard?.gameType,
        p_teams: formattedTeams
      });

      if (error) {
        console.error('Error creating team scorecard:', error);
        throw error;
      }

      // Delete the temporary scorecard
      await supabase
        .from('scorecards')
        .delete()
        .eq('id', scorecardId);
      
      // Navigate to the new scorecard
      navigate(`/scorecards/${data.id}`);
    } catch (error) {
      console.error('Error creating teams:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingScorecard) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 flex justify-center">
        <Loader className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center mb-4 sm:mb-6">
        <Button
          variant="secondary"
          className="mr-3 sm:mr-4 !py-1.5 sm:!py-2 !px-3 sm:!px-4 text-xs sm:text-sm"
          onClick={handleBack}
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          Back
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {step === 'weather' ? 'Select Weather' : 
           step === 'players' ? 'Add Players' : 
           'Form Teams'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        {step === 'weather' ? (
          <WeatherSelection
            onSelect={handleWeatherSelect}
            isLoading={isUpdating}
          />
        ) : step === 'players' ? (
          <PlayerSelection
            selectedPlayers={selectedPlayers}
            onSelect={handlePlayersSelect}
            onBack={() => setStep('weather')}
            isLoading={isUpdating}
          />
        ) : (
          <TeamFormation
            players={playerObjects}
            gameType={scorecard?.gameType || 'strokeplay'}
            onTeamsChange={setTeams}
            onNext={handleTeamsSubmit}
            onBack={() => setStep('players')}
          />
        )}
      </div>
    </div>
  );
}