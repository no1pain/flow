import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';
import type {
  TaskInsert,
  TaskUpdate,
  TaskFilters,
  TaskSortOptions,
  CommentInsert,
  CommentUpdate,
  TaskActivityInsert,
  TaskWithDetails,
} from '../types';

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getTasksByProject(projectId),
    enabled: !!projectId,
  });
}

export function useTasksWithDetails(
  projectId: string,
  filters?: TaskFilters,
  sort?: TaskSortOptions
) {
  return useQuery({
    queryKey: ['tasks', projectId, 'with-details', filters, sort],
    queryFn: () => taskService.getTasksWithDetails(projectId, filters, sort),
    enabled: !!projectId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id,
  });
}

export function useTaskWithDetails(id: string) {
  return useQuery({
    queryKey: ['task', id, 'with-details'],
    queryFn: () => taskService.getTaskWithDetails(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: TaskInsert) => taskService.createTask(task),
    onSuccess: (_, task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project_id, 'with-details'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) =>
      taskService.updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (old: TaskWithDetails[] | undefined) => {
        if (!old) return old;
        return old.map((task: TaskWithDetails) =>
          task.id === id ? { ...task, ...updates } : task
        );
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useComments(entityType: 'task' | 'document', entityId: string) {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => taskService.getCommentsByEntity(entityType, entityId),
    enabled: !!entityId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: CommentInsert) => taskService.createComment(comment),
    onSuccess: (_, comment) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', comment.entity_type, comment.entity_id],
      });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CommentUpdate }) =>
      taskService.updateComment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useTaskActivity(taskId: string) {
  return useQuery({
    queryKey: ['taskActivity', taskId],
    queryFn: () => taskService.getTaskActivity(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTaskActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activity: TaskActivityInsert) => taskService.createTaskActivity(activity),
    onSuccess: (_, activity) => {
      queryClient.invalidateQueries({ queryKey: ['taskActivity', activity.task_id] });
    },
  });
}
