import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/shared/Input';
import { FriendRequestList } from '../components/FriendRequestList';
import { SentRequestsList } from '../components/SentRequestsList';
import { FriendsList } from '../components/FriendsList';
import { UserSearchResults } from '../components/UserSearchResults';
import { useFriends } from '../hooks/useFriends';
import { useFriendRequests } from '../hooks/useFriendRequests';
import { useUserSearch } from '../hooks/useUserSearch';

export function FriendsPage() {
  const { 
    friends, 
    pendingRequests, 
    sentRequests,
    sendFriendRequest,
    cancelRequest,
    refresh: refreshFriends
  } = useFriends();

  const {
    acceptRequest,
    rejectRequest
  } = useFriendRequests();

  const { query, setQuery, results, isLoading } = useUserSearch();

  const handleAcceptRequest = async (requestId: string) => {
    const success = await acceptRequest(requestId);
    if (success) {
      refreshFriends();
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const success = await rejectRequest(requestId);
    if (success) {
      refreshFriends();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Find Friends Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Friends</h2>
            <Input
              label=""
              placeholder="Search by username..."
              icon={<Search className="w-5 h-5" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <UserSearchResults
              results={results}
              onSendRequest={sendFriendRequest}
              isLoading={isLoading}
            />
          </div>

          {/* Friend Requests Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Friend Requests
            </h2>
            <FriendRequestList
              requests={pendingRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          </div>

          {/* Sent Requests Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sent Requests
            </h2>
            <SentRequestsList
              requests={sentRequests}
              onCancel={cancelRequest}
            />
          </div>
        </div>

        {/* Right Column - Friends List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Friends ({friends.length})
          </h2>
          <FriendsList friends={friends} />
        </div>
      </div>
    </div>
  );
}