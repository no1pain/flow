'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TaskInsert, TaskUpdate, CommentInsert, CommentUpdate } from './types';

export async function createTask(task: TaskInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from('task_activity').insert({
    task_id: data.id,
    user_id: user.id,
    action: 'created',
    changes: { title: data.title },
  });

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${task.project_id}`);
  return data;
}

export async function updateTask(id: string, updates: TaskUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: currentTask } = await supabase.from('tasks').select('*').eq('id', id).single();

  if (!currentTask) {
    throw new Error('Task not found');
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Log activity based on changes
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  if (updates.status && updates.status !== currentTask.status) {
    changes.status = { from: currentTask.status, to: updates.status };
    await supabase.from('task_activity').insert({
      task_id: id,
      user_id: user.id,
      action: 'status_changed',
      changes: { status: changes.status },
    });
  }
  if (updates.priority && updates.priority !== currentTask.priority) {
    changes.priority = { from: currentTask.priority, to: updates.priority };
    await supabase.from('task_activity').insert({
      task_id: id,
      user_id: user.id,
      action: 'priority_changed',
      changes: { priority: changes.priority },
    });
  }
  if (updates.assignee_id !== undefined && updates.assignee_id !== currentTask.assignee_id) {
    changes.assignee_id = { from: currentTask.assignee_id, to: updates.assignee_id };
    await supabase.from('task_activity').insert({
      task_id: id,
      user_id: user.id,
      action: 'assignee_changed',
      changes: { assignee_id: changes.assignee_id },
    });
  }
  if (Object.keys(changes).length === 0) {
    await supabase.from('task_activity').insert({
      task_id: id,
      user_id: user.id,
      action: 'updated',
      changes,
    });
  }

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${currentTask.project_id}`);
  revalidatePath(`/dashboard/tasks/${id}`);
  return data;
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: currentTask } = await supabase
    .from('tasks')
    .select('project_id, title')
    .eq('id', id)
    .single();

  if (!currentTask) {
    throw new Error('Task not found');
  }

  // Log activity before deletion
  await supabase.from('task_activity').insert({
    task_id: id,
    user_id: user.id,
    action: 'deleted',
    changes: { title: currentTask.title },
  });

  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${currentTask.project_id}`);
}

export async function createComment(comment: CommentInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      ...comment,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity if comment is on a task
  if (comment.entity_type === 'task') {
    await supabase.from('task_activity').insert({
      task_id: comment.entity_id,
      user_id: user.id,
      action: 'comment_added',
      changes: { comment_id: data.id },
    });
  }

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/tasks/${comment.entity_id}`);
  return data;
}

export async function updateComment(id: string, updates: CommentUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/tasks/${data.entity_id}`);
  return data;
}

export async function deleteComment(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: currentComment } = await supabase
    .from('comments')
    .select('entity_id')
    .eq('id', id)
    .single();

  if (!currentComment) {
    throw new Error('Comment not found');
  }

  const { error } = await supabase.from('comments').delete().eq('id', id);

  if (error) throw error;

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/tasks/${currentComment.entity_id}`);
}
