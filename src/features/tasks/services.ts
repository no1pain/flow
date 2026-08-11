import { createClient } from '@/lib/supabase/client';
import type {
  Task,
  TaskInsert,
  TaskUpdate,
  TaskWithDetails,
  TaskFilters,
  TaskSortOptions,
  Comment,
  CommentInsert,
  CommentUpdate,
  CommentWithProfile,
  TaskActivity,
  TaskActivityInsert,
  TaskActivityWithProfile,
} from './types';

const supabase = createClient();

export const taskService = {
  async getTasksByProject(projectId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Task[];
  },

  async getTaskById(id: string) {
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();

    if (error) throw error;
    return data as Task;
  },

  async getTaskWithDetails(id: string): Promise<TaskWithDetails> {
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(
        `
        *,
        assignee:profiles!tasks_assignee_id_fkey (
          id,
          username,
          avatar_url
        ),
        creator:profiles!tasks_created_by_fkey (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single();

    if (taskError) throw taskError;

    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('entity_type', 'task')
      .eq('entity_id', id);

    const taskData = task as Task & {
      assignee?: { id: string; username: string; avatar_url: string | null };
      creator?: { id: string; username: string; avatar_url: string | null };
    };

    return {
      ...taskData,
      assignee: taskData.assignee,
      creator: taskData.creator,
      comment_count: commentCount || 0,
    } as TaskWithDetails;
  },

  async getTasksWithDetails(
    projectId: string,
    filters?: TaskFilters,
    sort?: TaskSortOptions
  ): Promise<TaskWithDetails[]> {
    let query = supabase
      .from('tasks')
      .select(
        `
        *,
        assignee:profiles!tasks_assignee_id_fkey (
          id,
          username,
          avatar_url
        ),
        creator:profiles!tasks_created_by_fkey (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('project_id', projectId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.assignee_id) {
      query = query.eq('assignee_id', filters.assignee_id);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const sortField = sort?.field || 'created_at';
    const sortOrder = sort?.order || 'desc';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) throw error;

    const tasksWithCommentCounts = await Promise.all(
      (
        data as (Task & {
          assignee?: { id: string; username: string; avatar_url: string | null };
          creator?: { id: string; username: string; avatar_url: string | null };
        })[]
      ).map(async (task) => {
        const { count: commentCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', 'task')
          .eq('entity_id', task.id);

        return {
          ...task,
          assignee: task.assignee,
          creator: task.creator,
          comment_count: commentCount || 0,
        } as TaskWithDetails;
      })
    );

    return tasksWithCommentCounts;
  },

  async createTask(task: TaskInsert) {
    const { data, error } = await supabase.from('tasks').insert(task).select().single();

    if (error) throw error;
    return data as Task;
  },

  async updateTask(id: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  async deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) throw error;
  },

  async getCommentsByEntity(
    entityType: 'task' | 'document',
    entityId: string
  ): Promise<CommentWithProfile[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        profiles (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(
      (comment: {
        id: string;
        entity_type: string;
        entity_id: string;
        content: string;
        created_by: string;
        created_at: string;
        updated_at: string;
        profiles: { id: string; username: string; avatar_url: string | null };
      }) => ({
        id: comment.id,
        entity_type: comment.entity_type,
        entity_id: comment.entity_id,
        content: comment.content,
        created_by: comment.created_by,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        profile: comment.profiles,
      })
    ) as CommentWithProfile[];
  },

  async createComment(comment: CommentInsert) {
    const { data, error } = await supabase.from('comments').insert(comment).select().single();

    if (error) throw error;
    return data as Comment;
  },

  async updateComment(id: string, updates: CommentUpdate) {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Comment;
  },

  async deleteComment(id: string) {
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) throw error;
  },

  async getTaskActivity(taskId: string): Promise<TaskActivityWithProfile[]> {
    const { data, error } = await supabase
      .from('task_activity')
      .select(
        `
        *,
        profiles (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(
      (activity: {
        id: string;
        task_id: string;
        user_id: string;
        action: string;
        changes: Record<string, unknown> | null;
        created_at: string;
        profiles: { id: string; username: string; avatar_url: string | null };
      }) => ({
        id: activity.id,
        task_id: activity.task_id,
        user_id: activity.user_id,
        action: activity.action,
        changes: activity.changes,
        created_at: activity.created_at,
        profile: activity.profiles,
      })
    ) as TaskActivityWithProfile[];
  },

  async createTaskActivity(activity: TaskActivityInsert) {
    const { data, error } = await supabase.from('task_activity').insert(activity).select().single();

    if (error) throw error;
    return data as TaskActivity;
  },
};
