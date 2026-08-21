'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTaskWithDetails } from '@/features/tasks/hooks/useTasks';
import { useComments } from '@/features/tasks/hooks/useTasks';
import { useTaskActivity } from '@/features/tasks/hooks/useTasks';
import { deleteTask, createComment, deleteComment } from '@/features/tasks/actions';
import type { TaskStatus, TaskPriority } from '@/features/tasks/types';
import { CommentList } from '@/features/tasks/components/CommentList';
import { TaskActivity } from '@/features/tasks/components/TaskActivity';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUp,
  MessageSquare,
  History,
} from 'lucide-react';
import { useState } from 'react';

const priorityConfig = {
  LOW: { label: 'Low', color: 'secondary', icon: ArrowUp },
  MEDIUM: { label: 'Medium', color: 'default', icon: ArrowUp },
  HIGH: { label: 'High', color: 'destructive', icon: ArrowUp },
  URGENT: { label: 'Urgent', color: 'destructive', icon: AlertCircle },
};

const statusConfig = {
  TODO: { label: 'Todo', color: 'secondary', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'default', icon: ArrowUp },
  DONE: { label: 'Done', color: 'default', icon: CheckCircle2 },
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

  const { data: task, isLoading: taskLoading } = useTaskWithDetails(taskId);
  const { data: comments, isLoading: commentsLoading } = useComments('task', taskId);
  const { data: activities, isLoading: activitiesLoading } = useTaskActivity(taskId);

  const handleAddComment = async (content: string) => {
    await createComment({
      entity_type: 'task',
      entity_id: taskId,
      content,
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const canDeleteComment = () => {
    // In a real app, you'd check if the current user is the comment author or has admin rights
    return true;
  };

  const handleDeleteTask = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        router.back();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Task not found</p>
          </div>
        </div>
      </div>
    );
  }

  const priority = priorityConfig[task.priority as TaskPriority];
  const status = statusConfig[task.status as TaskStatus];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{task.title}</h1>
              <Badge
                variant={priority.color as 'default' | 'secondary' | 'destructive' | 'outline'}
              >
                <PriorityIcon className="size-3 mr-1" />
                {priority.label}
              </Badge>
              <Badge variant={status.color as 'default' | 'secondary' | 'destructive' | 'outline'}>
                <StatusIcon className="size-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {new Date(task.created_at || '').toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit2 className="size-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              <Trash2 className="size-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {task.description ? (
                  <p className="text-base whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-muted-foreground">No description provided.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Button
                    variant={activeTab === 'comments' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('comments')}
                  >
                    <MessageSquare className="size-4 mr-2" />
                    Comments
                  </Button>
                  <Button
                    variant={activeTab === 'activity' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('activity')}
                  >
                    <History className="size-4 mr-2" />
                    Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'comments' ? (
                  <CommentList
                    comments={comments || []}
                    loading={commentsLoading}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    canDelete={canDeleteComment}
                  />
                ) : (
                  <TaskActivity activities={activities || []} loading={activitiesLoading} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
                <CardDescription>Additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge
                      variant={status.color as 'default' | 'secondary' | 'destructive' | 'outline'}
                    >
                      <StatusIcon className="size-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Priority</p>
                    <Badge
                      variant={
                        priority.color as 'default' | 'secondary' | 'destructive' | 'outline'
                      }
                    >
                      <PriorityIcon className="size-3 mr-1" />
                      {priority.label}
                    </Badge>
                  </div>
                  {task.assignee && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Assignee</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarImage src={task.assignee.avatar_url || undefined} />
                          <AvatarFallback>
                            {task.assignee.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{task.assignee.username}</span>
                      </div>
                    </div>
                  )}
                  {task.creator && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created by</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarImage src={task.creator.avatar_url || undefined} />
                          <AvatarFallback>
                            {task.creator.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{task.creator.username}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="font-medium">
                      {new Date(task.created_at || '').toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last updated</p>
                    <p className="font-medium">
                      {new Date(task.updated_at || '').toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
