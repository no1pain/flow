'use client';

import { useParams } from 'next/navigation';
import { useProjectWithDetails, useProjectMembers } from '@/features/projects/hooks/useProjects';
import { useWorkspaceStore } from '@/features/workspace/store';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Settings, Archive, CheckCircle, FolderKanban, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { archiveProject, activateProject } from '@/features/projects/actions';
import { AddMemberDialog } from '@/features/projects/components/AddMemberDialog';
import { ProjectMembersList } from '@/features/projects/components/ProjectMembersList';
import { TaskForm } from '@/features/tasks/components/TaskForm';
import { TaskList } from '@/features/tasks/components/TaskList';
import { createTask } from '@/features/tasks/actions';
import type { TaskInsert } from '@/features/tasks/types';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const { data: project, isLoading, error } = useProjectWithDetails(projectId);
  const { data: members } = useProjectMembers(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);

  const handleArchive = async () => {
    try {
      await archiveProject(projectId);
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  const handleActivate = async () => {
    try {
      await activateProject(projectId);
    } catch (error) {
      console.error('Failed to activate project:', error);
    }
  };

  const handleCreateTask = async (data: TaskInsert) => {
    setIsSubmittingTask(true);
    try {
      await createTask(data);
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'with-details'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setAddTaskOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleViewTask = (taskId: string) => {
    router.push(`/dashboard/tasks/${taskId}`);
  };

  const handleEditTask = (taskId: string) => {
    console.log('Edit task:', taskId);
    // TODO: Open edit dialog
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Project not found</p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = project.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? (
                  <>
                    <CheckCircle className="size-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <Archive className="size-3 mr-1" />
                    Archived
                  </>
                )}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {isActive ? (
              <Button variant="outline" onClick={handleArchive}>
                <Archive className="size-4 mr-2" />
                Archive
              </Button>
            ) : (
              <Button variant="outline" onClick={handleActivate}>
                <CheckCircle className="size-4 mr-2" />
                Activate
              </Button>
            )}
            <Button variant="outline">
              <Settings className="size-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Project information and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-base">{project.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tasks</p>
                    <p className="text-2xl font-bold">{project.task_count || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold">{members?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Manage project tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {isActive ? (
                  <TaskList
                    tasks={tasks || []}
                    loading={tasksLoading}
                    onViewTask={handleViewTask}
                    onCreateTask={handleCreateTask}
                    onEditTask={handleEditTask}
                    canEdit={true}
                    projectId={projectId}
                    members={
                      members?.map((m) => ({
                        id: m.user_id,
                        username: m.profile?.username || 'Unknown',
                        avatar_url: m.profile?.avatar_url,
                      })) || []
                    }
                  />
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>This project is archived. Activate it to manage tasks.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage project team</CardDescription>
                  </div>
                  {isActive && (
                    <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                      <Users className="size-4 mr-2" />
                      Add Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ProjectMembersList projectId={projectId} canEdit={isActive} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Workspace</p>
                    <p className="font-medium">{currentWorkspace?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project ID</p>
                    <p className="font-medium text-xs font-mono">{project.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={!isActive}
                    onClick={() => router.push(`/dashboard/projects/${projectId}/tasks`)}
                  >
                    <FolderKanban className="size-4 mr-2" />
                    View Tasks
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={!isActive}
                    onClick={() => setAddTaskOpen(true)}
                  >
                    <Plus className="size-4 mr-2" />
                    Add Task
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard/projects')}
                  >
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddMemberDialog projectId={projectId} open={addMemberOpen} onOpenChange={setAddMemberOpen} />
      <TaskForm
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onSubmit={handleCreateTask}
        projectId={projectId}
        members={
          members?.map((m) => ({
            id: m.user_id,
            username: m.profile?.username || 'Unknown',
            avatar_url: m.profile?.avatar_url,
          })) || []
        }
        isSubmitting={isSubmittingTask}
      />
    </div>
  );
}
