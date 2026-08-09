'use client';

import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { WorkspaceCard } from '@/features/workspace/components/WorkspaceCard';
import { CreateWorkspaceDialog } from '@/features/workspace/components/CreateWorkspaceDialog';
import { useWorkspaceStore } from '@/features/workspace/store';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { Workspace } from '@/features/workspace/types';

export default function WorkspacesPage() {
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const router = useRouter();

  const handleSwitchWorkspace = (workspaceId: string) => {
    const member = workspaces?.find((w) => w.workspaces?.[0]?.id === workspaceId);
    if (member?.workspaces?.[0]) {
      setCurrentWorkspace(member.workspaces[0] as Workspace);
      router.push(`/dashboard/workspaces/${workspaceId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Workspaces</h1>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Failed to load workspaces</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <CreateWorkspaceDialog />
        </div>

        {!workspaces || workspaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">No workspaces yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first workspace to get started with Flow.
              </p>
              <CreateWorkspaceDialog
                trigger={
                  <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors">
                    Create Workspace
                  </button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((member) => {
              const workspace = member.workspaces?.[0];
              if (!workspace) return null;
              return (
                <WorkspaceCard
                  key={member.workspace_id}
                  workspace={{
                    ...workspace,
                    members: [],
                    member_count: 0,
                  }}
                  currentRole={member.role}
                  onSwitch={handleSwitchWorkspace}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
