'use client';

import { useWorkspaceStore } from '@/features/workspace/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, FolderKanban } from 'lucide-react';

export default function TasksPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const router = useRouter();

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
                  Please select a workspace to view and manage tasks
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
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground mt-1">{currentWorkspace.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Tasks</CardTitle>
            <CardDescription>
              Tasks are managed within projects. Go to a project to view and manage its tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FolderKanban className="size-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                Select a project to view and manage tasks
              </p>
              <Button onClick={() => router.push('/dashboard/projects')}>
                <FolderKanban className="size-4 mr-2" />
                Go to Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
