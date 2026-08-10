'use client';

import { useParams } from 'next/navigation';
import { useProjectWithDetails } from '@/features/projects/hooks/useProjects';
import { useWorkspaceStore } from '@/features/workspace/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Settings, Archive, CheckCircle, FolderKanban, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { archiveProject, activateProject } from '@/features/projects/actions';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const { data: project, isLoading, error } = useProjectWithDetails(projectId);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
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
            <p className="text-slate-600 dark:text-slate-400">
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
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Description</p>
                    <p className="text-base">{project.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Tasks</p>
                    <p className="text-2xl font-bold">{project.task_count || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                    <p className="text-2xl font-bold">{project.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tasks</CardTitle>
                    <CardDescription>Manage project tasks</CardDescription>
                  </div>
                  <Button size="sm" disabled={!isActive}>
                    <Plus className="size-4 mr-2" />
                    New Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {isActive ? (
                    <>
                      <FolderKanban className="size-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks yet. Create your first task to get started.</p>
                    </>
                  ) : (
                    <p>This project is archived. Activate it to manage tasks.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Workspace</p>
                    <p className="font-medium">{currentWorkspace?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Created</p>
                    <p className="font-medium">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Project ID</p>
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
                  <Button variant="outline" className="w-full justify-start" disabled={!isActive}>
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
    </div>
  );
}
