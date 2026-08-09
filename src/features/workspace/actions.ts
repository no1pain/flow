'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  WorkspaceInsert,
  WorkspaceUpdate,
  WorkspaceMemberInsert,
  WorkspaceMemberUpdate,
  WorkspaceInvitationInsert,
  WorkspaceInvitationUpdate,
} from './types';

export async function createWorkspace(workspace: WorkspaceInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      ...workspace,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('workspace_members').insert({
    workspace_id: data.id,
    user_id: user.id,
    role: 'OWNER',
  });

  revalidatePath('/dashboard/workspaces');
  return data;
}

export async function updateWorkspace(id: string, updates: WorkspaceUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/workspaces');
  revalidatePath(`/dashboard/workspaces/${id}`);
  return data;
}

export async function deleteWorkspace(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase.from('workspaces').delete().eq('id', id);

  if (error) throw error;

  revalidatePath('/dashboard/workspaces');
}

export async function addWorkspaceMember(member: WorkspaceMemberInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase.from('workspace_members').insert(member).select().single();

  if (error) throw error;

  revalidatePath(`/dashboard/workspaces/${member.workspace_id}`);
  return data;
}

export async function updateWorkspaceMember(id: string, updates: WorkspaceMemberUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/workspaces');
  return data;
}

export async function removeWorkspaceMember(id: string, workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase.from('workspace_members').delete().eq('id', id);

  if (error) throw error;

  revalidatePath(`/dashboard/workspaces/${workspaceId}`);
}

export async function createInvitation(invitation: WorkspaceInvitationInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('workspace_invitations')
    .insert({
      ...invitation,
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/dashboard/workspaces/${invitation.workspace_id}`);
  return data;
}

export async function updateInvitation(id: string, updates: WorkspaceInvitationUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('workspace_invitations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/workspaces');
  return data;
}

export async function deleteInvitation(id: string, workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase.from('workspace_invitations').delete().eq('id', id);

  if (error) throw error;

  revalidatePath(`/dashboard/workspaces/${workspaceId}`);
}

export async function acceptInvitation(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get invitation details
  const { data: invitation, error: fetchError } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Add user to workspace members
  const { error: memberError } = await supabase.from('workspace_members').insert({
    workspace_id: invitation.workspace_id,
    user_id: user.id,
    role: invitation.role,
  });

  if (memberError) throw memberError;

  // Update invitation status
  const { data, error } = await supabase
    .from('workspace_invitations')
    .update({ status: 'ACCEPTED' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/workspaces');
  return data;
}

export async function declineInvitation(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('workspace_invitations')
    .update({ status: 'DECLINED' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/workspaces');
  return data;
}
