'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  ProjectInsert,
  ProjectUpdate,
  ProjectMemberInsert,
  ProjectMemberUpdate,
} from './types';

export async function createProject(project: ProjectInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/dashboard/workspaces/${project.workspace_id}`);
  return data;
}

export async function updateProject(id: string, updates: ProjectUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${id}`);
  return data;
}

export async function deleteProject(id: string, workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) throw error;

  revalidatePath(`/dashboard/workspaces/${workspaceId}`);
  revalidatePath('/dashboard/projects');
}

export async function archiveProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ status: 'ARCHIVED' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${id}`);
  return data;
}

export async function activateProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ status: 'ACTIVE' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${id}`);
  return data;
}

export async function addProjectMember(member: ProjectMemberInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase.from('project_members').insert(member).select().single();

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${member.project_id}`);
  return data;
}

export async function updateProjectMember(id: string, updates: ProjectMemberUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('project_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${data.project_id}`);
  return data;
}

export async function removeProjectMember(id: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase.from('project_members').delete().eq('id', id);

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${projectId}`);
}
