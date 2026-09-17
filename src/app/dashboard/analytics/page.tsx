'use client';

import { useWorkspaceStore } from '@/features/workspace/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  BarChart3,
  Users,
  FolderKanban,
  CheckCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useProjectsWithDetails } from '@/features/projects/hooks/useProjects';
import { useWorkspaceMembers } from '@/features/workspace/hooks/useWorkspaceMembers';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function AnalyticsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const router = useRouter();
  const { data: projects } = useProjectsWithDetails(currentWorkspace?.id || '');
  const { data: members } = useWorkspaceMembers(currentWorkspace?.id || '');

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-background p-8">
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
                  Please select a workspace to view analytics
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

  const activeProjects = projects?.filter((p) => p.status === 'ACTIVE') || [];
  const archivedProjects = projects?.filter((p) => p.status === 'ARCHIVED') || [];
  const totalTasks = projects?.reduce((sum, p) => sum + (p.task_count || 0), 0) || 0;
  const totalMembers = members?.length || 0;
  const ownerCount = members?.filter((m) => m.role === 'OWNER').length || 0;
  const adminCount = members?.filter((m) => m.role === 'ADMIN').length || 0;
  const memberCount = members?.filter((m) => m.role === 'MEMBER').length || 0;

  const getProjectHealth = (taskCount: number | undefined) => {
    if (!taskCount || taskCount === 0) return { label: 'No Tasks', color: 'secondary', value: 0 };
    if (taskCount < 5) return { label: 'Low Activity', color: 'default', value: 25 };
    if (taskCount < 15) return { label: 'Moderate', color: 'default', value: 50 };
    if (taskCount < 30) return { label: 'Active', color: 'default', value: 75 };
    return { label: 'Very Active', color: 'default', value: 100 };
  };

  const topProjects = [...(projects || [])]
    .sort((a, b) => (b.task_count || 0) - (a.task_count || 0))
    .slice(0, 5);

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
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">{currentWorkspace.name}</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects.length} active, {archivedProjects.length} archived
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">Across all projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                {ownerCount} owners, {adminCount} admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Tasks/Project</CardTitle>
              <BarChart3 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects?.length ? (totalTasks / projects.length).toFixed(1) : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Tasks per active project</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Project Activity
              </CardTitle>
              <CardDescription>Projects sorted by task count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No projects to display
                  </p>
                ) : (
                  topProjects.map((project) => {
                    const health = getProjectHealth(project.task_count);
                    const maxTasks = Math.max(...topProjects.map((p) => p.task_count || 0));
                    const percentage =
                      maxTasks > 0 ? ((project.task_count || 0) / maxTasks) * 100 : 0;

                    return (
                      <div key={project.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{project.name}</span>
                            <Badge
                              variant={
                                health.color as 'default' | 'secondary' | 'destructive' | 'outline'
                              }
                              className="text-xs"
                            >
                              {health.label}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {project.task_count || 0} tasks
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Composition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Team Composition
              </CardTitle>
              <CardDescription>Member roles distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {totalMembers === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No members to display
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Owners</span>
                        <span className="text-sm text-muted-foreground">{ownerCount}</span>
                      </div>
                      <Progress
                        value={totalMembers > 0 ? (ownerCount / totalMembers) * 100 : 0}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Admins</span>
                        <span className="text-sm text-muted-foreground">{adminCount}</span>
                      </div>
                      <Progress
                        value={totalMembers > 0 ? (adminCount / totalMembers) * 100 : 0}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Members</span>
                        <span className="text-sm text-muted-foreground">{memberCount}</span>
                      </div>
                      <Progress
                        value={totalMembers > 0 ? (memberCount / totalMembers) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Project Status Overview
            </CardTitle>
            <CardDescription>Active vs Archived projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-primary" />
                    <span className="text-sm font-medium">Active Projects</span>
                  </div>
                  <Badge variant="default">{activeProjects.length}</Badge>
                </div>
                <div className="space-y-2">
                  {activeProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{project.name}</span>
                      <span className="font-medium">{project.task_count || 0} tasks</span>
                    </div>
                  ))}
                  {activeProjects.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{activeProjects.length - 3} more active projects
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-secondary" />
                    <span className="text-sm font-medium">Archived Projects</span>
                  </div>
                  <Badge variant="secondary">{archivedProjects.length}</Badge>
                </div>
                <div className="space-y-2">
                  {archivedProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{project.name}</span>
                      <span className="font-medium">{project.task_count || 0} tasks</span>
                    </div>
                  ))}
                  {archivedProjects.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{archivedProjects.length - 3} more archived projects
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
