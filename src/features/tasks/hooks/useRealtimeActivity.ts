import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TaskActivityWithProfile } from '../types';

export function useRealtimeActivity(taskId: string, initialActivity: TaskActivityWithProfile[] = []) {
  const [activity, setActivity] = useState<TaskActivityWithProfile[]>(initialActivity);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`task_activity:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_activity',
          filter: `task_id=eq.${taskId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new activity with profile
            const { data: newActivity } = await supabase
              .from('task_activity')
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

            if (newActivity) {
              setActivity((prev) => [
                {
                  id: newActivity.id,
                  task_id: newActivity.task_id,
                  user_id: newActivity.user_id,
                  action: newActivity.action,
                  changes: newActivity.changes,
                  created_at: newActivity.created_at,
                  profile: newActivity.profiles,
                } as TaskActivityWithProfile,
                ...prev,
              ]);
            }
          } else if (payload.eventType === 'DELETE') {
            setActivity((prev) => prev.filter((act) => act.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, supabase]);

  return { activity, setActivity };
}
