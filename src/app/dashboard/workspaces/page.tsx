'use client';

import { useWorkspaces, useDeleteWorkspace } from '@/features/workspace/hooks/useWorkspaces';
import { WorkspaceCard } from '@/features/workspace/components/WorkspaceCard';
import { CreateWorkspaceDialog } from '@/features/workspace/components/CreateWorkspaceDialog';
import { EditWorkspaceDialog } from '@/features/workspace/components/EditWorkspaceDialog';
import { useWorkspaceStore } from '@/features/workspace/store';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import type { Workspace, WorkspaceWithMembers } from '@/features/workspace/types';

export default function WorkspacesPage() {
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const router = useRouter();
  const deleteWorkspace = useDeleteWorkspace();
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleSwitchWorkspace = (workspaceId: string) => {
    const member = workspaces?.find(
      (w) => (w.workspaces as unknown as Workspace)?.id === workspaceId
    );
    if (member?.workspaces) {
      setCurrentWorkspace(member.workspaces as unknown as Workspace);
      router.push(`/dashboard/workspaces/${workspaceId}`);
    }
  };

  const handleEditWorkspace = (workspaceId: string) => {
    const member = workspaces?.find(
      (w) => (w.workspaces as unknown as Workspace)?.id === workspaceId
    );
    if (member?.workspaces) {
      setEditingWorkspace(member.workspaces as unknown as Workspace);
      setEditDialogOpen(true);
    }
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this workspace? This will permanently delete all projects, tasks, and data associated with this workspace. This action cannot be undone.'
      )
    ) {
      deleteWorkspace.mutate(workspaceId, {
        onSuccess: () => {
          // Clear current workspace if it was the deleted one
          if (currentWorkspace?.id === workspaceId) {
            setCurrentWorkspace(null);
          }
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
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
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Failed to load workspaces</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <CreateWorkspaceDialog />
        </div>

        {!workspaces || workspaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-card rounded-lg shadow-lg p-8 border max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">No workspaces yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first workspace to get started with Flow.
              </p>
              <CreateWorkspaceDialog />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((member) => {
              const workspace = member.workspaces as unknown as Workspace | null;
              if (!workspace) return null;
              return (
                <WorkspaceCard
                  key={member.workspace_id}
                  workspace={
                    {
                      ...workspace,
                      members: [],
                      member_count:
                        (member.workspaces as { member_count?: number })?.member_count ?? 0,
                    } as unknown as WorkspaceWithMembers
                  }
                  currentRole={member.role}
                  onSwitch={handleSwitchWorkspace}
                  onEdit={handleEditWorkspace}
                  onDelete={handleDeleteWorkspace}
                />
              );
            })}
          </div>
        )}
      </div>

      {editingWorkspace && (
        <EditWorkspaceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          workspace={editingWorkspace}
        />
      )}
    </div>
  );
}
