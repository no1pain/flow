'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasksWithDetails } from '@/features/tasks/hooks/useTasks';
import { useProjectWithDetails } from '@/features/projects/hooks/useProjects';
import { useWorkspaceStore } from '@/features/workspace/store';
import { TaskList } from '@/features/tasks/components/TaskList';
import { createTask } from '@/features/tasks/actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderKanban } from 'lucide-react';
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

  const handleCreateTask = async (data: TaskInsert) => {
    await createTask(data);
  };

  const handleViewTask = (taskId: string) => {
    router.push(`/dashboard/tasks/${taskId}`);
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-8">
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
    <div className="min-h-screen bg-background p-8">
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
            <p className="text-slate-600 dark:text-slate-400">{currentWorkspace?.name}</p>
          </div>
        </div>

        {!isActive ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <FolderKanban className="size-12 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-4">Project is archived</h2>
              <p className="text-slate-600 dark:text-slate-400">
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
          />
        )}
      </div>
    </div>
  );
}
