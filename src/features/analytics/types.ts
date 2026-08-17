export interface AnalyticsMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  activeProjects: number;
  teamMembers: number;
}

export interface TaskAnalytics {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overTime: Array<{
    date: string;
    created: number;
    completed: number;
  }>;
}

export interface ProjectAnalytics {
  progress: Array<{
    projectId: string;
    projectName: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
}

export interface TeamAnalytics {
  performance: Array<{
    userId: string;
    userName: string;
    completed: number;
    assigned: number;
    percentage: number;
  }>;
}
