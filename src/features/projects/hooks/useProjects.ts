import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import type {
  ProjectInsert,
  ProjectUpdate,
  ProjectMemberInsert,
  ProjectMemberUpdate,
} from '../types';

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectService.getProjectsByWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useProjectsWithDetails(workspaceId: string) {
  return useQuery({
    queryKey: ['projects', workspaceId, 'with-details'],
    queryFn: () => projectService.getProjectsWithDetails(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
  });
}

export function useProjectWithDetails(id: string) {
  return useQuery({
    queryKey: ['project', id, 'with-details'],
    queryFn: () => projectService.getProjectWithDetails(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectInsert) => projectService.createProject(project),
    onSuccess: (_, project) => {
      queryClient.invalidateQueries({ queryKey: ['projects', project.workspace_id] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectUpdate }) =>
      projectService.updateProject(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.archiveProject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useActivateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.activateProject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: ProjectMemberInsert) => projectService.addProjectMember(member),
    onSuccess: (_, member) => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', member.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectMemberUpdate }) =>
      projectService.updateProjectMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers'] });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.removeProjectMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
