import { Database } from '@/types/supabase';

export type Workspace = Database['public']['Tables']['workspaces']['Row'];
export type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert'];
export type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update'];

export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];
export type WorkspaceMemberInsert = Database['public']['Tables']['workspace_members']['Insert'];
export type WorkspaceMemberUpdate = Database['public']['Tables']['workspace_members']['Update'];

export type WorkspaceInvitation = Database['public']['Tables']['workspace_invitations']['Row'];
export type WorkspaceInvitationInsert =
  Database['public']['Tables']['workspace_invitations']['Insert'];
export type WorkspaceInvitationUpdate =
  Database['public']['Tables']['workspace_invitations']['Update'];

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface WorkspaceWithMembers extends Workspace {
  members: (WorkspaceMember & {
    profile: {
      id: string;
      username: string | null;
      avatar_url: string | null;
    };
  })[];
  member_count: number;
}

export interface WorkspaceInvitationWithDetails extends WorkspaceInvitation {
  workspace: {
    id: string;
    name: string;
  };
  invited_by_profile: {
    username: string | null;
    avatar_url: string | null;
  };
}
