import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Player, Team, GameType } from '../../types';
import { calculateTeamHandicap } from '../../utils/teamHandicapCalculation';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface TeamFormationProps {
  players: Player[];
  gameType: GameType;
  onTeamsChange: (teams: Team[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TeamFormation({
  players,
  gameType,
  onTeamsChange,
  onNext,
  onBack
}: TeamFormationProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a default team name based on existing teams
  const getDefaultTeamName = () => {
    const teamCount = teams.length + 1;
    return `Team ${teamCount}`;
  };

  // Initialize form with default team name when opened
  const handleShowForm = () => {
    setTeamName(getDefaultTeamName());
    setShowForm(true);
  };

  const availablePlayers = players.filter(
    player => !teams.some(team => 
      team.id !== editingTeam?.id && 
      team.players.some(p => p.id === player.id)
    )
  );

  const handleAddTeam = () => {
    if (!teamName.trim() || selectedPlayers.length === 0) {
      setError("Team name and at least one player are required");
      return;
    }

    // Validate team size - allow 1-4 players for scramble
    if (selectedPlayers.length > 4) {
      setError("Scramble teams can have at most 4 players");
      return;
    }

    setError(null);
    
    // Find the player objects for the selected IDs
    const teamPlayers = players.filter(player => selectedPlayers.includes(player.id));
    
    // Extract handicaps, ensuring we handle null/undefined values
    const playerHandicaps = teamPlayers.map(player => {
      if (player.handicap === undefined || player.handicap === null) return 0;
      return typeof player.handicap === 'string' ? parseFloat(player.handicap) : player.handicap;
    });
    
    console.log('Creating team with player handicaps:', playerHandicaps);
    
    // For single player teams, use the player's handicap directly
    let teamHandicap: number;
    if (teamPlayers.length === 1) {
      teamHandicap = playerHandicaps[0];
      console.log('Single player team, using player handicap:', teamHandicap);
    } else {
      // Calculate team handicap for multiple players
      teamHandicap = calculateTeamHandicap(playerHandicaps, 'scramble');
      console.log('Calculated team handicap:', teamHandicap);
    }
    
    const newTeam: Team = {
      id: editingTeam?.id || crypto.randomUUID(),
      name: teamName,
      players: teamPlayers,
      handicap: teamHandicap
    };

    if (editingTeam) {
      setTeams(teams.map(team => team.id === editingTeam.id ? newTeam : team));
    } else {
      setTeams([...teams, newTeam]);
    }

    // Update parent component
    const updatedTeams = editingTeam 
      ? teams.map(team => team.id === editingTeam.id ? newTeam : team)
      : [...teams, newTeam];
    onTeamsChange(updatedTeams);

    // Reset form
    setTeamName('');
    setSelectedPlayers([]);
    setEditingTeam(null);
    setShowForm(false);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelectedPlayers(team.players.map(player => player.id));
    setShowForm(true);
  };

  const handleRemoveTeam = (teamId: string) => {
    const updatedTeams = teams.filter(team => team.id !== teamId);
    setTeams(updatedTeams);
    onTeamsChange(updatedTeams);
  };

  const handleTogglePlayer = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      // For scramble, limit to 4 players
      if (selectedPlayers.length >= 4) {
        setError("Scramble teams can have at most 4 players");
        return;
      }
      
      setError(null);
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const getTeamSizeMessage = () => {
    return 'Each team can have 1-4 players';
  };

  const isTeamSizeValid = (teamSize: number) => {
    return teamSize >= 1 && teamSize <= 4;
  };

  const canProceed = teams.length > 0 && teams.every(team => isTeamSizeValid(team.players.length));

  // Check if all players are assigned to teams
  const allPlayersAssigned = players.every(player => 
    teams.some(team => team.players.some(p => p.id === player.id))
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Form Teams</h3>
      
      {/* Team List */}
      <div className="space-y-4">
        {teams.map(team => (
          <div key={team.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{team.name}</h4>
                <p className="text-sm text-gray-500">Team Handicap: {team.handicap !== undefined && team.handicap !== null ? team.handicap : 0}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTeam(team)}
                  className="p-1 text-gray-400 hover:text-accent rounded-full hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveTeam(team.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {team.players.map(player => (
                <div key={player.id} className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
                  {player.username}
                  {player.id === user?.id && " (You)"}
                  {player.handicap !== undefined && player.handicap !== null && 
                    ` (${player.handicap})`
                  }
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add Team Button or Form */}
        {!showForm ? (
          <button
            onClick={handleShowForm}
            className="w-full p-3 border-2 border-dashed rounded-lg text-gray-500 hover:text-accent hover:border-accent transition-colors"
            disabled={availablePlayers.length === 0}
          >
            <Plus className="w-5 h-5 mx-auto" />
            <span className="block mt-1">Add Team</span>
          </button>
        ) : (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <Input
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name..."
              error={error && !teamName.trim() ? "Team name is required" : undefined}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Players ({getTeamSizeMessage()})
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {players.map(player => {
                  // Check if player is already in another team (and not the one being edited)
                  const isInOtherTeam = teams.some(team => 
                    team.id !== editingTeam?.id && 
                    team.players.some(p => p.id === player.id)
                  );
                  
                  if (isInOtherTeam) return null;
                  
                  return (
                    <div 
                      key={player.id}
                      className={`
                        flex items-center p-2 border rounded-lg cursor-pointer transition-colors
                        ${selectedPlayers.includes(player.id) 
                          ? 'border-accent bg-accent/5' 
                          : 'border-gray-200 hover:border-accent/30'}
                      `}
                      onClick={() => handleTogglePlayer(player.id)}
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
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
                          <p className="font-medium text-gray-900">
                            {player.username}
                            {player.id === user?.id && " (You)"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Handicap: {player.handicap !== undefined && player.handicap !== null 
                              ? player.handicap 
                              : "Not set"}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                        ${selectedPlayers.includes(player.id) 
                          ? 'bg-accent border-accent' 
                          : 'border-gray-300'}
                      `}>
                        {selectedPlayers.includes(player.id) && (
                          <div className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
                {availablePlayers.length === 0 && (
                  <p className="text-center text-gray-500 py-2">No more players available</p>
                )}
              </div>
              {error && selectedPlayers.length === 0 && (
                <p className="mt-1 text-sm text-red-500">At least one player is required</p>
              )}
              {error && selectedPlayers.length > 0 && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setTeamName('');
                  setSelectedPlayers([]);
                  setEditingTeam(null);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTeam}
                disabled={!teamName.trim() || selectedPlayers.length === 0}
              >
                {editingTeam ? 'Update Team' : 'Add Team'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {!allPlayersAssigned && players.length > 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          <p>Not all players are assigned to teams. Unassigned players:</p>
          <ul className="list-disc list-inside mt-1">
            {players
              .filter(player => !teams.some(team => team.players.some(p => p.id === player.id)))
              .map(player => (
                <li key={player.id}>
                  {player.username}
                  {player.id === user?.id && " (You)"}
                  {player.handicap !== undefined && player.handicap !== null && 
                    ` (${player.handicap})`
                  }
                </li>
              ))}
          </ul>
        </div>
      )}

      {!canProceed && teams.length > 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          <p>Please ensure all teams have the correct number of players:</p>
          <ul className="list-disc list-inside mt-1">
            {teams.filter(team => !isTeamSizeValid(team.players.length)).map(team => (
              <li key={team.id}>
                {team.name} has {team.players.length} player{team.players.length !== 1 ? 's' : ''} 
                (needs 1-4)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="secondary" 
          onClick={onBack}
          className="!py-2 !px-4 text-sm"
        >
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          className="!py-2 !px-4 text-sm"
        >
          Create Scorecard
        </Button>
      </div>
    </div>
  );
}