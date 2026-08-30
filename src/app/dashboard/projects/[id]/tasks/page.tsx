'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasksWithDetails, useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useProjectWithDetails } from '@/features/projects/hooks/useProjects';
import { useWorkspaceStore } from '@/features/workspace/store';
import { TaskList } from '@/features/tasks/components/TaskList';
import { createTask } from '@/features/tasks/actions';
import type { TaskStatus } from '@/features/tasks/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FolderKanban, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectMembers } from '@/features/projects/hooks/useProjects';
import type { TaskFilters, TaskSortOptions, TaskInsert } from '@/features/tasks/types';

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const [filters, setFilters] = useState<TaskFilters>({});
  const [sort, setSort] = useState<TaskSortOptions>({ field: 'created_at', order: 'desc' });

  const { data: project, isLoading: projectLoading } = useProjectWithDetails(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasksWithDetails(projectId, filters, sort);
  const { data: members } = useProjectMembers(projectId);
  const updateTask = useUpdateTask();

  const handleCreateTask = async (data: TaskInsert) => {
    await createTask(data);
  };

  const handleViewTask = (taskId: string) => {
    router.push(`/dashboard/tasks/${taskId}`);
  };

  const handleStatusToggle = (taskId: string) => {
    const task = tasks?.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';

    updateTask.mutate({
      id: taskId,
      updates: { status: newStatus },
    });
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="bg-destructive/10 rounded-full p-4 mb-4 mx-auto w-fit">
                  <Trash2 className="size-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Project not found</h3>
                <p className="text-muted-foreground mb-6">
                  This project may have been deleted or you don&apos;t have permission to view it.
                </p>
                <Button onClick={() => router.push('/dashboard/projects')}>Go to Projects</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isActive = project.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.name} - Tasks</h1>
            <p className="text-muted-foreground">{currentWorkspace?.name}</p>
          </div>
        </div>

        {!isActive ? (
          <div className="text-center py-12">
            <div className="bg-card rounded-lg shadow-lg p-8 border max-w-md mx-auto">
              <FolderKanban className="size-12 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-4">Project is archived</h2>
              <p className="text-muted-foreground">
                This project is archived. Activate it to manage tasks.
              </p>
            </div>
          </div>
        ) : (
          <TaskList
            tasks={tasks || []}
            loading={tasksLoading}
            onViewTask={handleViewTask}
            onCreateTask={handleCreateTask}
            canEdit={true}
            projectId={projectId}
            members={members?.map((m) => m.profile) || []}
            onFilterChange={setFilters}
            onSortChange={setSort}
            onStatusToggle={handleStatusToggle}
          />
        )}
      </div>
    </div>
  );
}
