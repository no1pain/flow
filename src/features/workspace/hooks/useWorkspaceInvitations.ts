import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services';
import type { WorkspaceInvitationInsert, WorkspaceInvitationUpdate } from '../types';

export function useWorkspaceInvitations(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace-invitations', workspaceId],
    queryFn: () => workspaceService.getWorkspaceInvitations(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useUserInvitations(email: string) {
  return useQuery({
    queryKey: ['user-invitations', email],
    queryFn: () => workspaceService.getUserInvitations(email),
    enabled: !!email,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitation: WorkspaceInvitationInsert) =>
      workspaceService.createInvitation(invitation),
    onSuccess: (_, { workspace_id }) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations', workspace_id] });
    },
  });
}

export function useUpdateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: WorkspaceInvitationUpdate }) =>
      workspaceService.updateInvitation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceService.deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      workspaceService.acceptInvitation(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceService.declineInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });
}
