'use client';

import { useProjectsWithDetails } from '@/features/projects/hooks/useProjects';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { CreateProjectDialog } from '@/features/projects/components/CreateProjectDialog';
import { useWorkspaceStore } from '@/features/workspace/store';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProjectsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const { data: projects, isLoading, error } = useProjectsWithDetails(currentWorkspace?.id || '');
  const router = useRouter();

  const handleViewProject = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">Please select a workspace first</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => router.push('/dashboard/workspaces')}
            >
              Go to Workspaces
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/workspaces')}
                className="mb-4"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to Workspaces
              </Button>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground mt-1">{currentWorkspace.name}</p>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Failed to load projects</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/workspaces')}
              className="mb-4"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Workspaces
            </Button>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">{currentWorkspace.name}</p>
          </div>
          <CreateProjectDialog workspaceId={currentWorkspace.id} />
        </div>

        {!projects || projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-card rounded-lg shadow-lg p-8 border max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">No projects yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first project to start organizing your tasks.
              </p>
              <CreateProjectDialog
                workspaceId={currentWorkspace.id}
                trigger={
                  <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors">
                    Create Project
                  </button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                canEdit={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
