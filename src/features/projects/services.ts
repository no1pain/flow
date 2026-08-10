import { createClient } from '@/lib/supabase/client';
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectWithDetails,
  ProjectMember,
  ProjectMemberInsert,
  ProjectMemberUpdate,
  ProjectMemberWithProfile,
} from './types';

const supabase = createClient();

export const projectService = {
  async getProjectsByWorkspace(workspaceId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  async getProjectById(id: string) {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

    if (error) throw error;
    return data as Project;
  },

  async getProjectWithDetails(id: string): Promise<ProjectWithDetails> {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError) throw projectError;

    const { count: taskCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    return {
      ...project,
      task_count: taskCount || 0,
    } as ProjectWithDetails;
  },

  async getProjectsWithDetails(workspaceId: string): Promise<ProjectWithDetails[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const projectsWithDetails = await Promise.all(
      (projects as Project[]).map(async (project) => {
        const [{ count: taskCount }, { count: memberCount }] = await Promise.all([
          supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id),
          supabase
            .from('project_members')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id),
        ]);

        return {
          ...project,
          task_count: taskCount || 0,
          member_count: memberCount || 0,
        } as ProjectWithDetails;
      })
    );

    return projectsWithDetails;
  },

  async createProject(project: ProjectInsert) {
    const { data, error } = await supabase.from('projects').insert(project).select().single();

    if (error) throw error;
    return data as Project;
  },

  async updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) throw error;
  },

  async archiveProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async activateProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'ACTIVE' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async getProjectMembers(projectId: string): Promise<ProjectMemberWithProfile[]> {
    const { data, error } = await supabase
      .from('project_members')
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
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(
      (member: {
        id: string;
        project_id: string;
        user_id: string;
        role: string;
        created_at: string;
        profiles: { id: string; username: string; avatar_url: string | null };
      }) => ({
        id: member.id,
        project_id: member.project_id,
        user_id: member.user_id,
        role: member.role,
        created_at: member.created_at,
        profile: member.profiles,
      })
    ) as ProjectMemberWithProfile[];
  },

  async addProjectMember(member: ProjectMemberInsert): Promise<ProjectMember> {
    const { data, error } = await supabase.from('project_members').insert(member).select().single();

    if (error) throw error;
    return data as ProjectMember;
  },

  async updateProjectMember(id: string, updates: ProjectMemberUpdate): Promise<ProjectMember> {
    const { data, error } = await supabase
      .from('project_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProjectMember;
  },

  async removeProjectMember(id: string): Promise<void> {
    const { error } = await supabase.from('project_members').delete().eq('id', id);

    if (error) throw error;
  },
};
