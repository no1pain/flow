'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { taskService } from '@/features/tasks/services';
import { workspaceService } from '@/features/workspace/services';
import { projectService } from '@/features/projects/services';

interface TeamMemberWorkload {
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  workloadPercentage: number;
  projects: Array<{
    projectId: string;
    projectName: string;
    taskCount: number;
  }>;
}

interface TeamWorkloadProps {
  workspaceId: string;
}

export function TeamWorkload({ workspaceId }: TeamWorkloadProps) {
  const { data: workload = [], isLoading: loading } = useQuery({
    queryKey: ['teamWorkload', workspaceId],
    queryFn: async (): Promise<TeamMemberWorkload[]> => {
      const [tasks, members, projects] = await Promise.all([
        taskService.getTasksByWorkspace(workspaceId),
        workspaceService.getWorkspaceMembers(workspaceId),
        projectService.getProjects(workspaceId),
      ]);

      const memberWorkloadMap = new Map<string, TeamMemberWorkload>();

      // Initialize workload for all members
      members.forEach(
        (member: {
          user_id: string;
          profiles?: { username?: string; full_name?: string; avatar_url?: string };
        }) => {
          memberWorkloadMap.set(member.user_id, {
            memberId: member.user_id,
            memberName: member.profiles?.username || member.profiles?.full_name || 'Unknown',
            memberAvatar: member.profiles?.avatar_url,
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            overdueTasks: 0,
            highPriorityTasks: 0,
            workloadPercentage: 0,
            projects: [],
          });
        }
      );

      // Calculate workload from tasks
      const now = new Date();
      tasks.forEach(
        (task: {
          assignee_id?: string;
          status: string;
          priority: string;
          due_date?: string;
          project_id?: string;
        }) => {
          if (task.assignee_id && memberWorkloadMap.has(task.assignee_id)) {
            const memberWorkload = memberWorkloadMap.get(task.assignee_id)!;
            memberWorkload.totalTasks++;

            if (task.status === 'DONE') {
              memberWorkload.completedTasks++;
            } else if (task.status === 'IN_PROGRESS') {
              memberWorkload.inProgressTasks++;
            }

            if (task.priority === 'HIGH' || task.priority === 'URGENT') {
              memberWorkload.highPriorityTasks++;
            }

            if (task.due_date && new Date(task.due_date) < now && task.status !== 'DONE') {
              memberWorkload.overdueTasks++;
            }

            // Track project distribution
            if (task.project_id) {
              const project = projects.find(
                (p: { id: string; name: string }) => p.id === task.project_id
              );
              if (project) {
                const existingProject = memberWorkload.projects.find(
                  (p) => p.projectId === project.id
                );
                if (existingProject) {
                  existingProject.taskCount++;
                } else {
                  memberWorkload.projects.push({
                    projectId: project.id,
                    projectName: project.name,
                    taskCount: 1,
                  });
                }
              }
            }
          }
        }
      );

      // Calculate workload percentage (based on active tasks)
      const maxTasks = Math.max(
        ...Array.from(memberWorkloadMap.values()).map((m) => m.totalTasks),
        1
      );
      memberWorkloadMap.forEach((member) => {
        member.workloadPercentage = Math.round((member.totalTasks / maxTasks) * 100);
      });

      return Array.from(memberWorkloadMap.values());
    },
    enabled: !!workspaceId,
  });

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getWorkloadBadge = (member: TeamMemberWorkload) => {
    if (member.overdueTasks > 0) {
      return <Badge variant="destructive">{member.overdueTasks} overdue</Badge>;
    }
    if (member.highPriorityTasks > 2) {
      return <Badge variant="destructive">{member.highPriorityTasks} high priority</Badge>;
    }
    if (member.inProgressTasks > 5) {
      return <Badge variant="secondary">High workload</Badge>;
    }
    return <Badge variant="outline">On track</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (workload.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No team members found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Workload</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sorted by workload</span>
        </div>
      </div>

      {workload
        .sort((a, b) => b.totalTasks - a.totalTasks)
        .map((member) => (
          <Card key={member.memberId}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {member.memberAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.memberAvatar}
                          alt={member.memberName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-medium">
                          {member.memberName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{member.memberName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getWorkloadBadge(member)}
                        <span className="text-sm text-muted-foreground">
                          {member.totalTasks} tasks total
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getWorkloadColor(member.workloadPercentage)}`}
                    >
                      {member.workloadPercentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">workload</div>
                  </div>
                </div>

                <Progress value={member.workloadPercentage} className="h-2" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Completed</div>
                    <div className="font-semibold text-green-600">{member.completedTasks}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">In Progress</div>
                    <div className="font-semibold text-blue-600">{member.inProgressTasks}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">High Priority</div>
                    <div className="font-semibold text-red-600">{member.highPriorityTasks}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Overdue</div>
                    <div className="font-semibold text-red-600">{member.overdueTasks}</div>
                  </div>
                </div>

                {member.projects.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Projects</div>
                    <div className="flex flex-wrap gap-2">
                      {member.projects.map((project) => (
                        <Badge key={project.projectId} variant="outline">
                          {project.projectName} ({project.taskCount})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
