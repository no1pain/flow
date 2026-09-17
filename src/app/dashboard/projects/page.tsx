'use client';

import {
  useProjectsWithDetails,
  useDeleteProject,
  useArchiveProject,
  useActivateProject,
} from '@/features/projects/hooks/useProjects';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { CreateProjectDialog } from '@/features/projects/components/CreateProjectDialog';
import { EditProjectDialog } from '@/features/projects/components/EditProjectDialog';
import { useWorkspaceStore } from '@/features/workspace/store';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Search, Filter, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState, useMemo } from 'react';
import type { Project } from '@/features/projects/types';

export default function ProjectsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const { data: projects, isLoading, error } = useProjectsWithDetails(currentWorkspace?.id || '');
  const router = useRouter();
  const deleteProject = useDeleteProject();
  const archiveProject = useArchiveProject();
  const activateProject = useActivateProject();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [projectToArchive, setProjectToArchive] = useState<string | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [projectToActivate, setProjectToActivate] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'ARCHIVED'>('all');
  const [taskCountFilter, setTaskCountFilter] = useState<'all' | 'none' | 'some' | 'many'>('all');

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description &&
          project.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

      // Task count filter
      let matchesTaskCount = true;
      if (taskCountFilter === 'none') {
        matchesTaskCount = !project.task_count || project.task_count === 0;
      } else if (taskCountFilter === 'some') {
        matchesTaskCount = (project.task_count ?? 0) > 0 && (project.task_count ?? 0) < 10;
      } else if (taskCountFilter === 'many') {
        matchesTaskCount = (project.task_count ?? 0) >= 10;
      }

      return matchesSearch && matchesStatus && matchesTaskCount;
    });
  }, [projects, searchQuery, statusFilter, taskCountFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTaskCountFilter('all');
  };

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'all' || taskCountFilter !== 'all';

  const handleViewProject = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    if (project) {
      setEditingProject(project);
      setEditDialogOpen(true);
    }
  };

  const handleArchiveProject = (projectId: string) => {
    setProjectToArchive(projectId);
    setArchiveDialogOpen(true);
  };

  const handleActivateProject = (projectId: string) => {
    setProjectToActivate(projectId);
    setActivateDialogOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const confirmArchiveProject = () => {
    if (projectToArchive) {
      archiveProject.mutate(projectToArchive);
      setProjectToArchive(null);
    }
  };

  const confirmActivateProject = () => {
    if (projectToActivate) {
      activateProject.mutate(projectToActivate);
      setProjectToActivate(null);
    }
  };

  // Show loading state while checking for workspace
  if (isLoading && !currentWorkspace) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground mt-1">Loading...</p>
            </div>
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

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="bg-primary/10 rounded-full p-4 mb-4 mx-auto w-fit">
                  <svg
                    className="size-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No workspace selected</h3>
                <p className="text-muted-foreground mb-6">
                  Please select a workspace to view and manage projects
                </p>
                <Button onClick={() => router.push('/dashboard/workspaces')}>
                  Go to Workspaces
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
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
      <div className="min-h-screen bg-background p-4 md:p-8">
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

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder="Search projects by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value: 'all' | 'ACTIVE' | 'ARCHIVED') => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={taskCountFilter}
                onValueChange={(value: 'all' | 'none' | 'some' | 'many') =>
                  setTaskCountFilter(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="none">No Tasks</SelectItem>
                  <SelectItem value="some">1-9 Tasks</SelectItem>
                  <SelectItem value="many">10+ Tasks</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="hover:text-destructive">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-destructive">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {taskCountFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Tasks: {taskCountFilter}
                  <button
                    onClick={() => setTaskCountFilter('all')}
                    className="hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {!filteredProjects || filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-card rounded-lg shadow-lg p-8 border max-w-md mx-auto">
              {hasActiveFilters ? (
                <>
                  <h2 className="text-xl font-semibold mb-4">No projects match your filters</h2>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters to find what you&apos;re looking for.
                  </p>
                  <Button onClick={clearFilters}>
                    <X className="size-4 mr-2" />
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4">No projects yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Create your first project to start organizing your tasks.
                  </p>
                  <CreateProjectDialog workspaceId={currentWorkspace.id} />
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Showing {filteredProjects.length} of {projects?.length || 0} projects
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={handleViewProject}
                  onEdit={handleEditProject}
                  onArchive={handleArchiveProject}
                  onActivate={handleActivateProject}
                  onDelete={handleDeleteProject}
                  canEdit={true}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will permanently delete all tasks and data associated with this project. This action cannot be undone."
        onConfirm={confirmDeleteProject}
        cancelText="Cancel"
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive Project"
        description="Are you sure you want to archive this project? Archived projects can be reactivated later."
        onConfirm={confirmArchiveProject}
        cancelText="Cancel"
        confirmText="Archive"
        variant="default"
      />

      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title="Activate Project"
        description="Are you sure you want to activate this project? This will make it available for task management."
        onConfirm={confirmActivateProject}
        cancelText="Cancel"
        confirmText="Activate"
        variant="default"
      />

      {editingProject && (
        <EditProjectDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          project={editingProject}
        />
      )}
    </div>
  );
}
