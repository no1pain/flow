import { createClient } from '@/lib/supabase/client';
import type { TimeEntry, TimeEntryWithRelations, TimeSummary } from './types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const supabase = createClient();

export const timeTrackingService = {
  async getTimeEntries(
    userId: string,
    workspaceId: string,
    limit = 50
  ): Promise<TimeEntryWithRelations[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(
        `
        *,
        task:tasks(id, title),
        project:projects(id, name)
      `
      )
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as TimeEntryWithRelations[];
  },

  async getActiveTimeEntry(
    userId: string,
    workspaceId: string
  ): Promise<TimeEntryWithRelations | null> {
    const { data, error } = await supabase
      .from('time_entries')
      .select(
        `
        *,
        task:tasks(id, title),
        project:projects(id, name)
      `
      )
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as TimeEntryWithRelations | null;
  },

  async startTimeEntry(
    userId: string,
    taskId: string,
    workspaceId: string,
    projectId?: string,
    description?: string
  ): Promise<TimeEntry> {
    // First, stop any active time entry
    const activeEntry = await this.getActiveTimeEntry(userId, workspaceId);
    if (activeEntry) {
      await this.stopTimeEntry(activeEntry.id);
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: userId,
        task_id: taskId,
        project_id: projectId,
        workspace_id: workspaceId,
        description,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async stopTimeEntry(entryId: string): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        ended_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTimeEntry(
    entryId: string,
    updates: Partial<Pick<TimeEntry, 'description' | 'task_id' | 'project_id'>>
  ): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTimeEntry(entryId: string): Promise<void> {
    const { error } = await supabase.from('time_entries').delete().eq('id', entryId);

    if (error) throw error;
  },

  async getTimeSummary(userId: string, workspaceId: string): Promise<TimeSummary> {
    const entries = await this.getTimeEntries(userId, workspaceId, 1000);

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const totalDuration = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const todayDuration = entries
      .filter((entry) => {
        const started = new Date(entry.started_at);
        return started >= todayStart && started <= todayEnd;
      })
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const weekDuration = entries
      .filter((entry) => {
        const started = new Date(entry.started_at);
        return started >= weekStart && started <= weekEnd;
      })
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const monthDuration = entries
      .filter((entry) => {
        const started = new Date(entry.started_at);
        return started >= monthStart && started <= monthEnd;
      })
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    return {
      totalDuration,
      todayDuration,
      weekDuration,
      monthDuration,
      entries,
    };
  },

  subscribeToTimeEntries(
    userId: string,
    workspaceId: string,
    callback: (payload: { eventType: string; new?: TimeEntry; old?: TimeEntry }) => void
  ) {
    return supabase
      .channel(`time_entries:${userId}:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as TimeEntry | undefined,
            old: payload.old as TimeEntry | undefined,
          });
        }
      )
      .subscribe();
  },
};
