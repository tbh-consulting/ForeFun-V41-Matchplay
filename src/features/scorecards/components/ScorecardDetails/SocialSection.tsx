import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useLikes } from '../../hooks/useLikes';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface SocialSectionProps {
  scorecardId: string;
}

export function SocialSection({ scorecardId }: SocialSectionProps) {
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const { likes, hasLiked, toggleLike, fetchLikes } = useLikes(scorecardId);
  const { comments, addComment, deleteComment, fetchComments } = useComments(scorecardId);

  // Initial fetch of likes and comments
  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [fetchLikes, fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addComment(comment);
    setComment('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 ${
              hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } transition-colors`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{likes.length}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-500">
            <MessageCircle className="w-5 h-5" />
            <span>{comments.length}</span>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="space-y-6">
        {/* Comment form */}
        {user && (
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <Input
              label=""
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
            />
            <Button type="submit" disabled={!comment.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user.avatarUrl || 'https://via.placeholder.com/40'}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900">
                      {comment.user.username}
                    </span>
                    {user?.id === comment.user.id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{comment.content}</p>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}