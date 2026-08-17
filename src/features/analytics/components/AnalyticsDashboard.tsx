'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { taskService } from '@/features/tasks/services';
import { projectService } from '@/features/projects/services';
import { format, subDays, startOfDay } from 'date-fns';

interface AnalyticsData {
  tasksByStatus: Array<{ name: string; value: number; color: string }>;
  tasksByPriority: Array<{ name: string; value: number; color: string }>;
  tasksOverTime: Array<{ date: string; completed: number; created: number }>;
  projectProgress: Array<{ name: string; completed: number; total: number; percentage: number }>;
  teamPerformance: Array<{ name: string; completed: number; assigned: number; percentage: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  DONE: '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  URGENT: '#dc2626',
};

export function AnalyticsDashboard({ workspaceId }: { workspaceId: string }) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data, isLoading: loading } = useQuery({
    queryKey: ['analytics', workspaceId, timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const [tasks, projects] = await Promise.all([
        taskService.getTasksByWorkspace(workspaceId),
        projectService.getProjects(workspaceId),
      ]);

      // Tasks by status
      const tasksByStatus = Object.entries(
        tasks.reduce(
          (acc: Record<string, number>, task: { status: string }) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      ).map(([name, value]) => ({
        name,
        value: value as number,
        color: STATUS_COLORS[name] || '#94a3b8',
      }));

      // Tasks by priority
      const tasksByPriority = Object.entries(
        tasks.reduce(
          (acc: Record<string, number>, task: { priority: string }) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      ).map(([name, value]) => ({
        name,
        value: value as number,
        color: PRIORITY_COLORS[name] || '#94a3b8',
      }));

      // Tasks over time
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const tasksOverTime = Array.from({ length: days }, (_, i) => {
        const date = startOfDay(subDays(new Date(), days - 1 - i));
        const dateStr = format(date, 'MMM dd');

        const created = tasks.filter(
          (task: { created_at?: string }) =>
            task.created_at && startOfDay(new Date(task.created_at)).getTime() === date.getTime()
        ).length;

        const completed = tasks.filter(
          (task: { status: string; updated_at?: string }) =>
            task.status === 'DONE' &&
            task.updated_at &&
            startOfDay(new Date(task.updated_at)).getTime() === date.getTime()
        ).length;

        return { date: dateStr, created, completed };
      });

      // Project progress
      const projectProgress = projects.map((project: { id: string; name: string }) => {
        const projectTasks = tasks.filter(
          (task: { project_id?: string; status: string }) => task.project_id === project.id
        );
        const completed = projectTasks.filter(
          (task: { status: string }) => task.status === 'DONE'
        ).length;
        const total = projectTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          name: project.name,
          completed,
          total,
          percentage,
        };
      });

      // Team performance
      const teamPerformance = Object.entries(
        tasks.reduce(
          (
            acc: Record<string, { assigned: number; completed: number }>,
            task: { assignee_id?: string; status: string }
          ) => {
            if (task.assignee_id) {
              if (!acc[task.assignee_id]) {
                acc[task.assignee_id] = { assigned: 0, completed: 0 };
              }
              acc[task.assignee_id].assigned++;
              if (task.status === 'DONE') {
                acc[task.assignee_id].completed++;
              }
            }
            return acc;
          },
          {} as Record<string, { assigned: number; completed: number }>
        )
      ).map(([name, stats]) => ({
        name,
        completed: (stats as { assigned: number; completed: number }).completed,
        assigned: (stats as { assigned: number; completed: number }).assigned,
        percentage:
          (stats as { assigned: number; completed: number }).assigned > 0
            ? Math.round(
                ((stats as { assigned: number; completed: number }).completed /
                  (stats as { assigned: number; completed: number }).assigned) *
                  100
              )
            : 0,
      }));

      return {
        tasksByStatus,
        tasksByPriority,
        tasksOverTime,
        projectProgress,
        teamPerformance,
      };
    },
    enabled: !!workspaceId,
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </Card>
    );
  }

  const totalTasks = data.tasksByStatus.reduce((sum, item) => sum + item.value, 0);
  const completedTasks = data.tasksByStatus.find((item) => item.name === 'DONE')?.value || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select
          value={timeRange}
          onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.projectProgress.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tasks by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tasks Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tasks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.tasksOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.projectProgress.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground">
                      {project.completed}/{project.total} ({project.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.teamPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="assigned" fill="#3b82f6" name="Assigned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
