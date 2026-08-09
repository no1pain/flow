import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services';
import type { WorkspaceInsert, WorkspaceUpdate } from '../types';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getUserWorkspaces(),
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceService.getWorkspaceById(id),
    enabled: !!id,
  });
}

export function useWorkspaceWithMembers(id: string) {
  return useQuery({
    queryKey: ['workspace', id, 'with-members'],
    queryFn: () => workspaceService.getWorkspaceWithMembers(id),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspace: WorkspaceInsert) => workspaceService.createWorkspace(workspace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: WorkspaceUpdate }) =>
      workspaceService.updateWorkspace(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', id] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceService.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
