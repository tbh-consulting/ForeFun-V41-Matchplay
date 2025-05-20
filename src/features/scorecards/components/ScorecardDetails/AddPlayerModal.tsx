import React from 'react';
import { Search } from 'lucide-react';
import { Modal } from '@/components/shared/Modal/Modal';
import { Input } from '@/components/shared/Input';
import { usePlayerSearch } from '../../hooks/usePlayerSearch';
import { useAddPlayer } from '../../hooks/useAddPlayer';
import { PlayerSearchList } from './PlayerSearchList';
import { handleError } from '../../utils/errorHandling';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  scorecardId: string;
  onPlayerAdded: () => Promise<void>;
  existingPlayerIds: string[];
}

export function AddPlayerModal({
  isOpen,
  onClose,
  scorecardId,
  onPlayerAdded,
  existingPlayerIds
}: AddPlayerModalProps) {
  const { query, setQuery, results, isLoading: isSearching } = usePlayerSearch(existingPlayerIds);
  const { addPlayer, isLoading: isAdding } = useAddPlayer();

  const handleAddPlayer = async (playerId: string) => {
    try {
      const success = await addPlayer(scorecardId, playerId);
      
      if (success) {
        await onPlayerAdded(); // Wait for refresh to complete
        onClose();
      }
    } catch (error) {
      const scorecardError = handleError(error, 'Failed to add player');
      console.error('Error adding player:', scorecardError);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Player"
    >
      <div className="space-y-4">
        <Input
          label="Search Players"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
          placeholder="Search by username..."
        />

        <div className="max-h-[300px] overflow-y-auto">
          <PlayerSearchList
            players={results}
            onSelect={handleAddPlayer}
            isLoading={isAdding}
            isSearching={isSearching}
          />
        </div>
      </div>
    </Modal>
  );
}