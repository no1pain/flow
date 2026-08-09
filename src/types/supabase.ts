export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          owner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string | null;
          created_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          created_at?: string;
        };
      };
      workspace_invitations: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          role: 'ADMIN' | 'MEMBER' | 'GUEST';
          invited_by: string;
          status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role: 'ADMIN' | 'MEMBER' | 'GUEST';
          invited_by?: string;
          status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role?: 'ADMIN' | 'MEMBER' | 'GUEST';
          invited_by?: string;
          status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
          created_at?: string;
          expires_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          status: 'ACTIVE' | 'ARCHIVED';
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          status?: 'ACTIVE' | 'ARCHIVED';
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          status?: 'ACTIVE' | 'ARCHIVED';
          created_by?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: 'TODO' | 'IN_PROGRESS' | 'DONE';
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          assignee_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          assignee_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          assignee_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          content: Json | null;
          created_by: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          content?: Json | null;
          created_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          content?: Json | null;
          created_by?: string | null;
          updated_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
