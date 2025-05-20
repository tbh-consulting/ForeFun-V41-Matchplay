import React, { useState } from 'react';
import { Users, Plus, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Player, Team, GameType } from '../../types';
import { calculateTeamHandicap } from '../../utils/teamHandicapCalculation';

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
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const availablePlayers = players.filter(
    player => !teams.some(team => 
      team.players.some(p => p.id === player.id)
    ) || (editingTeam && editingTeam.players.some(p => p.id === player.id))
  );

  const handleAddTeam = () => {
    if (!teamName.trim() || selectedPlayers.length === 0) return;

    const teamPlayers = players.filter(player => selectedPlayers.includes(player.id));
    const playerHandicaps = teamPlayers.map(player => player.handicap);
    
    const newTeam: Team = {
      id: editingTeam?.id || crypto.randomUUID(),
      name: teamName,
      players: teamPlayers,
      handicap: calculateTeamHandicap(playerHandicaps, gameType === 'scramble' ? 'scramble' : '4ball')
    };

    if (editingTeam) {
      setTeams(teams.map(team => team.id === editingTeam.id ? newTeam : team));
    } else {
      setTeams([...teams, newTeam]);
    }

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
    setTeams(teams.filter(team => team.id !== teamId));
  };

  const handleTogglePlayer = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleSubmit = () => {
    onTeamsChange(teams);
    onNext();
  };

  const getTeamSizeLimit = () => {
    return gameType === '4ball' ? 2 : 4;
  };

  const isTeamSizeValid = (teamSize: number) => {
    if (gameType === '4ball') {
      return teamSize === 2;
    }
    return teamSize >= 2 && teamSize <= 4;
  };

  const getTeamSizeMessage = () => {
    if (gameType === '4ball') {
      return 'Each team must have exactly 2 players';
    }
    return 'Each team must have 2-4 players';
  };

  const canProceed = teams.length > 0 && teams.every(team => isTeamSizeValid(team.players.length));

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
                <p className="text-sm text-gray-500">Team Handicap: {team.handicap}</p>
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
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add Team Button or Form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full p-3 border-2 border-dashed rounded-lg text-gray-500 hover:text-accent hover:border-accent transition-colors"
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
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Players ({getTeamSizeMessage()})
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availablePlayers.map(player => (
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
                        <p className="font-medium text-gray-900">{player.username}</p>
                        {player.handicap !== undefined && (
                          <p className="text-xs text-gray-500">Handicap: {player.handicap}</p>
                        )}
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
                ))}
                {availablePlayers.length === 0 && (
                  <p className="text-center text-gray-500 py-2">No more players available</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setTeamName('');
                  setSelectedPlayers([]);
                  setEditingTeam(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTeam}
                disabled={!teamName.trim() || selectedPlayers.length === 0 || selectedPlayers.length > getTeamSizeLimit()}
              >
                {editingTeam ? 'Update Team' : 'Add Team'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {!canProceed && teams.length > 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          <p>Please ensure all teams have the correct number of players:</p>
          <ul className="list-disc list-inside mt-1">
            {teams.filter(team => !isTeamSizeValid(team.players.length)).map(team => (
              <li key={team.id}>
                {team.name} has {team.players.length} player{team.players.length !== 1 ? 's' : ''} 
                (needs {gameType === '4ball' ? 'exactly 2' : '2-4'})
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
          onClick={handleSubmit}
          disabled={!canProceed}
          className="!py-2 !px-4 text-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}