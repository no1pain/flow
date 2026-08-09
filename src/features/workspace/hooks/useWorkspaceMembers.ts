import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services';
import type { WorkspaceMemberInsert, WorkspaceMemberUpdate } from '../types';

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => workspaceService.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useMemberRole(workspaceId: string, userId: string) {
  return useQuery({
    queryKey: ['member-role', workspaceId, userId],
    queryFn: () => workspaceService.getMemberRole(workspaceId, userId),
    enabled: !!workspaceId && !!userId,
  });
}

export function useAddWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: WorkspaceMemberInsert) => workspaceService.addWorkspaceMember(member),
    onSuccess: (_, { workspace_id }) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspace_id] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace_id, 'with-members'] });
    },
  });
}

export function useUpdateWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: WorkspaceMemberUpdate }) =>
      workspaceService.updateWorkspaceMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    },
  });
}

export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceService.removeWorkspaceMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    },
  });
}
