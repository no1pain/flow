'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeTrackingService } from '../services';
import type { TimeEntry } from '../types';

export function useTimeEntries(userId: string, workspaceId: string) {
  return useQuery({
    queryKey: ['timeEntries', userId, workspaceId],
    queryFn: () => timeTrackingService.getTimeEntries(userId, workspaceId),
    enabled: !!userId && !!workspaceId,
  });
}

export function useActiveTimeEntry(userId: string, workspaceId: string) {
  return useQuery({
    queryKey: ['activeTimeEntry', userId, workspaceId],
    queryFn: () => timeTrackingService.getActiveTimeEntry(userId, workspaceId),
    enabled: !!userId && !!workspaceId,
    refetchInterval: 1000, // Refetch every second to update duration
  });
}

export function useTimeSummary(userId: string, workspaceId: string) {
  return useQuery({
    queryKey: ['timeSummary', userId, workspaceId],
    queryFn: () => timeTrackingService.getTimeSummary(userId, workspaceId),
    enabled: !!userId && !!workspaceId,
  });
}

export function useStartTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      taskId,
      workspaceId,
      projectId,
      description,
    }: {
      userId: string;
      taskId: string;
      workspaceId: string;
      projectId?: string;
      description?: string;
    }) => timeTrackingService.startTimeEntry(userId, taskId, workspaceId, projectId, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timeEntries', variables.userId, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['activeTimeEntry', variables.userId, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['timeSummary', variables.userId, variables.workspaceId],
      });
    },
  });
}

export function useStopTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; userId: string; workspaceId: string }) =>
      timeTrackingService.stopTimeEntry(entryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timeEntries', variables.userId, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['activeTimeEntry', variables.userId, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['timeSummary', variables.userId, variables.workspaceId],
      });
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      updates,
    }: {
      entryId: string;
      updates: Partial<Pick<TimeEntry, 'description' | 'task_id' | 'project_id'>>;
      userId: string;
      workspaceId: string;
    }) => timeTrackingService.updateTimeEntry(entryId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timeEntries', variables.userId, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['timeSummary', variables.userId, variables.workspaceId],
      });
    },
  });
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; userId: string; workspaceId: string }) =>
      timeTrackingService.deleteTimeEntry(entryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timeEntries', variables.userId, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['timeSummary', variables.userId, variables.workspaceId],
      });
    },
  });
}
