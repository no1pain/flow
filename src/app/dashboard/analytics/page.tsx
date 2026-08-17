'use client';

import { useWorkspaceStore } from '@/features/workspace/store';
import { AnalyticsDashboard } from '@/features/analytics/components/AnalyticsDashboard';
import { TeamWorkload } from '@/features/analytics/components/TeamWorkload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4">No workspace selected</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Please select a workspace to view analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workload">Team Workload</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <AnalyticsDashboard workspaceId={currentWorkspace.id} />
          </TabsContent>
          <TabsContent value="workload">
            <TeamWorkload workspaceId={currentWorkspace.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
