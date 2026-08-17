export interface TimeEntry {
  id: string;
  user_id: string;
  task_id: string;
  project_id?: string;
  workspace_id: string;
  started_at: string;
  ended_at?: string;
  duration?: number; // in seconds
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeEntryWithRelations extends TimeEntry {
  task?: {
    id: string;
    title: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface TimeSummary {
  totalDuration: number; // in seconds
  todayDuration: number;
  weekDuration: number;
  monthDuration: number;
  entries: TimeEntryWithRelations[];
}
