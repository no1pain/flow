import type { Database } from '@/types/supabase';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export type TaskActivity = Database['public']['Tables']['task_activity']['Row'];
export type TaskActivityInsert = Database['public']['Tables']['task_activity']['Insert'];
export type TaskActivityAction = TaskActivity['action'];

export type EntityType = 'task' | 'document';

export interface TaskWithDetails extends Task {
  assignee?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  creator?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  comment_count?: number;
}

export interface CommentWithProfile extends Comment {
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface TaskActivityWithProfile extends TaskActivity {
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  search?: string;
}

export interface TaskSortOptions {
  field: 'created_at' | 'updated_at' | 'priority' | 'status' | 'title';
  order: 'asc' | 'desc';
}
