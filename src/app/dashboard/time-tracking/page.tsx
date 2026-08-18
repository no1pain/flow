'use client';

import { useWorkspaceStore } from '@/features/workspace/store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { TimeTracker } from '@/features/time-tracking/components/TimeTracker';
import { TimeEntriesList } from '@/features/time-tracking/components/TimeEntriesList';
import { useTimeSummary } from '@/features/time-tracking/hooks/useTimeTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, Calendar, Award } from 'lucide-react';
import { formatDurationHuman } from '@/lib/utils/time';

export default function TimeTrackingPage() {
  const { user } = useAuth();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const { data: summary, isLoading } = useTimeSummary(user?.id || '', currentWorkspace?.id || '');

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-8 border">
            <h2 className="text-xl font-semibold mb-4">No workspace selected</h2>
            <p className="text-muted-foreground">Please select a workspace to track time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Time Tracking</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : formatDurationHuman(summary?.todayDuration || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : formatDurationHuman(summary?.weekDuration || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : formatDurationHuman(summary?.monthDuration || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : formatDurationHuman(summary?.totalDuration || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Tracker */}
        <TimeTracker />

        {/* Time Entries */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Time Entries</h2>
          <TimeEntriesList />
        </div>
      </div>
    </div>
  );
}
