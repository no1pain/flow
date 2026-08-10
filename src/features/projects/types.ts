import { Database } from '@/types/supabase';

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export interface ProjectWithDetails extends Project {
  task_count?: number;
  member_count?: number;
}
