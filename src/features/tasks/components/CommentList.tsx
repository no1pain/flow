'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, AtSign } from 'lucide-react';
import type { CommentWithProfile } from '../types';
import { parseMentions } from '@/lib/utils/mentions';

interface CommentListProps {
  comments: CommentWithProfile[];
  loading?: boolean;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
  canDelete?: () => boolean;
  availableUsers?: { id: string; username: string }[];
}

export function CommentList({
  comments,
  loading = false,
  onAddComment,
  onDeleteComment,
  canDelete,
  availableUsers = [],
}: CommentListProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
      setShowMentionSuggestions(false);
      setMentionQuery('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);
    setCursorPosition(e.target.selectionStart);

    // Check for @ symbol to trigger mention suggestions
    const textBeforeCursor = value.slice(0, e.target.selectionStart);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's a space after @ (which would end the mention)
      if (!textAfterAt.includes(' ') && textAfterAt.length > 0) {
        setMentionQuery(textAfterAt);
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
        setMentionQuery('');
      }
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery('');
    }
  };

  const handleSelectMention = (username: string) => {
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textBeforeMention = textBeforeCursor.slice(0, lastAtIndex);
    const textAfterCursor = newComment.slice(cursorPosition);

    const newCommentText = `${textBeforeMention}@${username} ${textAfterCursor}`;
    setNewComment(newCommentText);
    setShowMentionSuggestions(false);
    setMentionQuery('');

    // Focus textarea and set cursor position after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = textBeforeMention.length + username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const filteredUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const renderCommentContent = (content: string) => {
    const mentions = parseMentions(content);
    if (mentions.length === 0) return <p className="text-sm">{content}</p>;

    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;

    mentions.forEach((mention) => {
      if (mention.index > lastIndex) {
        parts.push(content.slice(lastIndex, mention.index));
      }
      parts.push(
        <span key={mention.index} className="font-semibold text-primary">
          @{mention.username}
        </span>
      );
      lastIndex = mention.index + mention.length;
    });

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return <p className="text-sm">{parts}</p>;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex gap-3">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment... Type @ to mention users"
            value={newComment}
            onChange={handleTextareaChange}
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

        {showMentionSuggestions && filteredUsers.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectMention(user.username)}
                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
              >
                <AtSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.username}</span>
              </button>
            ))}
          </div>
        )}
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
                {renderCommentContent(comment.content)}
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
