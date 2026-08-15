import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CommentWithProfile } from '../types';

export function useRealtimeComments(
  entityType: 'task' | 'document',
  entityId: string,
  initialComments: CommentWithProfile[] = []
) {
  const [comments, setComments] = useState<CommentWithProfile[]>(initialComments);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${entityType}:${entityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `entity_type=eq.${entityType}&entity_id=eq.${entityId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new comment with profile
            const { data: newComment } = await supabase
              .from('comments')
              .select(
                `
                *,
                profiles (
                  id,
                  username,
                  avatar_url
                )
              `
              )
              .eq('id', payload.new.id)
              .single();

            if (newComment) {
              setComments((prev) => [
                ...prev,
                {
                  id: newComment.id,
                  entity_type: newComment.entity_type,
                  entity_id: newComment.entity_id,
                  content: newComment.content,
                  created_by: newComment.created_by,
                  created_at: newComment.created_at,
                  updated_at: newComment.updated_at,
                  profile: newComment.profiles,
                } as CommentWithProfile,
              ]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === payload.new.id
                  ? { ...comment, ...payload.new, updated_at: payload.new.updated_at }
                  : comment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) => prev.filter((comment) => comment.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entityType, entityId, supabase]);

  return { comments, setComments };
}
