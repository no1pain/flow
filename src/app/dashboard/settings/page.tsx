'use client';

import { useWorkspaceStore } from '@/features/workspace/store';
import { Card, CardContent } from '@/components/ui/card';
import { Settings as SettingsIcon, Clock } from 'lucide-react';

export default function SettingsPage() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">{currentWorkspace?.name}</p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="bg-primary/10 rounded-full p-4 mb-4 mx-auto w-fit">
                <SettingsIcon className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                Settings and configuration options will be available here in the future.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>Stay tuned for updates</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
