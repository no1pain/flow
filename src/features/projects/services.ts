import { createClient } from '@/lib/supabase/client';
import type { Project, ProjectInsert, ProjectUpdate, ProjectWithDetails } from './types';

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
        const { count: taskCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        return {
          ...project,
          task_count: taskCount || 0,
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
};
