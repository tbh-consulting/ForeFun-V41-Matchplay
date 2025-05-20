import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader, ArrowLeft, Trash2, UserPlus, Share2 } from 'lucide-react';
import { ScorecardHeader } from '../components/ScorecardDetails/ScorecardHeader';
import { ScoreGrid } from '../components/ScorecardDetails/ScoreGrid';
import { TeamScoreGrid } from '../components/ScorecardDetails/TeamScoreGrid';
import { ScorecardSummary } from '../components/ScorecardDetails/ScorecardSummary';
import { SocialSection } from '../components/ScorecardDetails/SocialSection';
import { SocialShare } from '../components/ScorecardDetails/SocialShare';
import { AddPlayerModal } from '../components/ScorecardDetails/AddPlayerModal';
import { TeamDisplay } from '../components/ScorecardDetails/TeamDisplay';
import { Modal } from '@/components/shared/Modal/Modal';
import { Button } from '@/components/shared/Button';
import { useScorecard } from '../hooks/useScorecard';
import { useDeleteScorecard } from '../hooks/useDeleteScorecard';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function ScorecardDetailsPage() {
  const { scorecardId } = useParams<{ scorecardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { 
    scorecard, 
    scores,
    isLoading,
    updateScore,
    refresh
  } = useScorecard(scorecardId!);
  
  const { deleteScorecard, isLoading: isDeleting } = useDeleteScorecard();

  if (isLoading || !scorecard) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-4 sm:px-6 py-8">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-accent mx-auto" />
          <p className="mt-2 text-gray-600">Loading scorecard...</p>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === scorecard.createdBy;
  const isTeamGame = scorecard.gameType === 'scramble' || scorecard.gameType === '4ball';

  // Calculate relative scores and points for sharing
  const playerScores = (isTeamGame && scorecard.teams ? 
    scorecard.teams.map(team => ({
      username: team.name,
      handicap: team.handicap,
      relativeScore: Object.values(scores[team.id] || {}).reduce((sum, score) => sum + (score.gross || 0), 0),
      points: Object.values(scores[team.id] || {}).reduce((sum, score) => sum + (score.points || 0), 0),
      scores: scores[team.id] || {}
    })) :
    scorecard.players.map(player => ({
      username: player.username,
      handicap: player.handicap,
      relativeScore: Object.values(scores[player.id] || {}).reduce((sum, score) => sum + (score.gross || 0), 0),
      points: Object.values(scores[player.id] || {}).reduce((sum, score) => sum + (score.points || 0), 0),
      scores: scores[player.id] || {}
    }))
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/scorecards')}
                className="p-2 text-gray-400 hover:text-accent rounded-full hover:bg-accent/5 transition-colors"
                title="Back to List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Scorecard Details</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 text-gray-400 hover:text-accent rounded-full hover:bg-accent/5 transition-colors"
                title="Share scorecard"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {isCreator && !scorecard.completedAt && !isTeamGame && (
                <button
                  onClick={() => setShowAddPlayerModal(true)}
                  className="p-2 text-gray-400 hover:text-accent rounded-full hover:bg-accent/5 transition-colors"
                  title="Add player"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              )}
              {isCreator && (
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete scorecard"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <ScorecardHeader
            courseName={scorecard.courseName}
            date={scorecard.date}
            weather={scorecard.weather}
            gameType={scorecard.gameType}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-8 mt-8">
          <div className="flex-1 min-w-0">
            {isTeamGame && scorecard.teams ? (
              <>
                <TeamScoreGrid
                  holes={scorecard.holes}
                  teams={scorecard.teams}
                  scores={scores}
                  onScoreChange={updateScore}
                  isCreator={isCreator}
                  isCompleted={!!scorecard.completedAt}
                  currentUserId={user?.id}
                />
              </>
            ) : (
              <ScoreGrid
                holes={scorecard.holes}
                players={scorecard.players}
                scores={scores}
                onScoreChange={updateScore}
                isCreator={isCreator}
                isCompleted={!!scorecard.completedAt}
                currentPlayerId={user?.id}
              />
            )}
          </div>

          <div className="xl:w-[350px] xl:flex-shrink-0">
            <div className="xl:sticky xl:top-[200px] space-y-6">
              {/* Team information for team games */}
              {isTeamGame && scorecard.teams && (
                <div className="space-y-4">
                  {scorecard.teams.map(team => (
                    <TeamDisplay key={team.id} team={team} />
                  ))}
                </div>
              )}
              
              <ScorecardSummary
                players={isTeamGame && scorecard.teams 
                  ? scorecard.teams.map(team => ({
                      id: team.id,
                      username: team.name,
                      handicap: team.handicap,
                      isTeam: true
                    }))
                  : scorecard.players
                }
                scores={scores}
                isTeamGame={isTeamGame}
              />
              <SocialSection scorecardId={scorecardId!} />
            </div>
          </div>
        </div>

        {/* Add Player Modal */}
        <AddPlayerModal
          isOpen={showAddPlayerModal}
          onClose={() => setShowAddPlayerModal(false)}
          scorecardId={scorecardId!}
          onPlayerAdded={refresh}
          existingPlayerIds={scorecard.players.map(p => p.id)}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Scorecard"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this scorecard? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteScorecard(scorecardId!)}
                isLoading={isDeleting}
                className="!bg-red-600 hover:!bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        {/* Share Modal */}
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share Scorecard"
        >
          <SocialShare
            scorecardId={scorecardId!}
            courseName={scorecard.courseName}
            date={scorecard.date}
            holes={scorecard.holes}
            players={playerScores}
            onClose={() => setShowShareModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
}