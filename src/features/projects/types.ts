export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          status: 'ACTIVE' | 'ARCHIVED';
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          status?: 'ACTIVE' | 'ARCHIVED';
          created_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          status?: 'ACTIVE' | 'ARCHIVED';
          created_by?: string;
          created_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          created_at?: string;
        };
      };
    };
  };
}

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ProjectMember = Database['public']['Tables']['project_members']['Row'];
export type ProjectMemberInsert = Database['public']['Tables']['project_members']['Insert'];
export type ProjectMemberUpdate = Database['public']['Tables']['project_members']['Update'];

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type ProjectMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

export interface ProjectWithDetails extends Project {
  task_count?: number;
  member_count?: number;
}

export interface ProjectMemberWithProfile extends ProjectMember {
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}
