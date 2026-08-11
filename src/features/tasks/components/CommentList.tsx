'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import type { CommentWithProfile } from '../types';

interface CommentListProps {
  comments: CommentWithProfile[];
  loading?: boolean;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
  canDelete?: () => boolean;
}

export function CommentList({
  comments,
  loading = false,
  onAddComment,
  onDeleteComment,
  canDelete,
}: CommentListProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          className="flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim() || submitting}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No comments yet.</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="size-8">
                <AvatarImage src={comment.profile.avatar_url || undefined} />
                <AvatarFallback>{comment.profile.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{comment.profile.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
                {canDelete?.() && onDeleteComment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteComment(comment.id)}
                    className="h-6 px-2 text-xs text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
