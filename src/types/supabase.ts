export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
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
          role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          invited_by: string;
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          invited_by?: string;
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
          invited_by?: string;
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
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
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: 'TODO' | 'IN_PROGRESS' | 'DONE';
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          assignee_id: string | null;
          created_by: string;
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
          created_by?: string;
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
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          entity_type: 'task' | 'document';
          entity_id: string;
          content: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: 'task' | 'document';
          entity_id: string;
          content: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: 'task' | 'document';
          entity_id?: string;
          content?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_activity: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          action:
            | 'created'
            | 'updated'
            | 'status_changed'
            | 'priority_changed'
            | 'assignee_changed'
            | 'comment_added'
            | 'deleted';
          changes: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          action:
            | 'created'
            | 'updated'
            | 'status_changed'
            | 'priority_changed'
            | 'assignee_changed'
            | 'comment_added'
            | 'deleted';
          changes?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          action?:
            | 'created'
            | 'updated'
            | 'status_changed'
            | 'priority_changed'
            | 'assignee_changed'
            | 'comment_added'
            | 'deleted';
          changes?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
  };
}
