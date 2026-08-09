import { createClient } from '@/lib/supabase/client';
import type {
  Workspace,
  WorkspaceInsert,
  WorkspaceUpdate,
  WorkspaceMember,
  WorkspaceMemberInsert,
  WorkspaceMemberUpdate,
  WorkspaceInvitation,
  WorkspaceInvitationInsert,
  WorkspaceInvitationUpdate,
  WorkspaceWithMembers,
  WorkspaceInvitationWithDetails,
} from './types';

type WorkspaceMemberWithProfile = WorkspaceMember & {
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
};

type WorkspaceInvitationWithRelations = WorkspaceInvitation & {
  workspaces: {
    id: string;
    name: string;
  };
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
};

const supabase = createClient();

export const workspaceService = {
  async getUserWorkspaces() {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(
        `
        workspace_id,
        role,
        workspaces (*)
      `
      )
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getWorkspaceById(id: string) {
    const { data, error } = await supabase.from('workspaces').select('*').eq('id', id).single();

    if (error) throw error;
    return data as Workspace;
  },

  async getWorkspaceWithMembers(id: string): Promise<WorkspaceWithMembers> {
    const { data, error } = await supabase
      .from('workspaces')
      .select(
        `
        *,
        workspace_members (
          *,
          profiles (id, username, avatar_url)
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      members: data.workspace_members.map((member: WorkspaceMemberWithProfile) => ({
        ...member,
        profile: member.profiles,
      })),
      member_count: data.workspace_members.length,
    } as WorkspaceWithMembers;
  },

  async createWorkspace(workspace: WorkspaceInsert) {
    const { data, error } = await supabase.from('workspaces').insert(workspace).select().single();

    if (error) throw error;
    return data as Workspace;
  },

  async updateWorkspace(id: string, updates: WorkspaceUpdate) {
    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Workspace;
  },

  async deleteWorkspace(id: string) {
    const { error } = await supabase.from('workspaces').delete().eq('id', id);

    if (error) throw error;
  },

  async getWorkspaceMembers(workspaceId: string) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(
        `
        *,
        profiles (id, username, avatar_url)
      `
      )
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async addWorkspaceMember(member: WorkspaceMemberInsert) {
    const { data, error } = await supabase
      .from('workspace_members')
      .insert(member)
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceMember;
  },

  async updateWorkspaceMember(id: string, updates: WorkspaceMemberUpdate) {
    const { data, error } = await supabase
      .from('workspace_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceMember;
  },

  async removeWorkspaceMember(id: string) {
    const { error } = await supabase.from('workspace_members').delete().eq('id', id);

    if (error) throw error;
  },

  async getMemberRole(workspaceId: string, userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data?.role || null;
  },

  async getWorkspaceInvitations(workspaceId: string) {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select(
        `
        *,
        workspaces (id, name),
        profiles!invited_by (username, avatar_url)
      `
      )
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((inv: WorkspaceInvitationWithRelations) => ({
      ...inv,
      workspace: inv.workspaces,
      invited_by_profile: inv.profiles,
    })) as WorkspaceInvitationWithDetails[];
  },

  async getUserInvitations(email: string) {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select(
        `
        *,
        workspaces (id, name),
        profiles!invited_by (username, avatar_url)
      `
      )
      .eq('email', email)
      .eq('status', 'PENDING')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((inv: WorkspaceInvitationWithRelations) => ({
      ...inv,
      workspace: inv.workspaces,
      invited_by_profile: inv.profiles,
    })) as WorkspaceInvitationWithDetails[];
  },

  async createInvitation(invitation: WorkspaceInvitationInsert) {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .insert(invitation)
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceInvitation;
  },

  async updateInvitation(id: string, updates: WorkspaceInvitationUpdate) {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceInvitation;
  },

  async deleteInvitation(id: string) {
    const { error } = await supabase.from('workspace_invitations').delete().eq('id', id);

    if (error) throw error;
  },

  async acceptInvitation(id: string, userId: string) {
    const { data: invitation, error: fetchError } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error: memberError } = await supabase.from('workspace_members').insert({
      workspace_id: invitation.workspace_id,
      user_id: userId,
      role: invitation.role,
    });

    if (memberError) throw memberError;

    const { data, error } = await supabase
      .from('workspace_invitations')
      .update({ status: 'ACCEPTED' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceInvitation;
  },

  async declineInvitation(id: string) {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .update({ status: 'DECLINED' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceInvitation;
  },
};
