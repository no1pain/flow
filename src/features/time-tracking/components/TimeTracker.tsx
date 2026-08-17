'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useActiveTimeEntry, useStartTimeEntry, useStopTimeEntry } from '../hooks/useTimeTracking';
import { useWorkspaceStore } from '@/features/workspace/store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDuration } from '@/lib/utils/time';

export function TimeTracker({ taskId, projectId }: { taskId?: string; projectId?: string }) {
  const { user } = useAuth();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [description, setDescription] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const { data: activeEntry, isLoading } = useActiveTimeEntry(
    user?.id || '',
    currentWorkspace?.id || ''
  );
  const startTimeEntry = useStartTimeEntry();
  const stopTimeEntry = useStopTimeEntry();

  useEffect(() => {
    if (!activeEntry?.is_active || !activeEntry.started_at) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  const elapsed =
    activeEntry?.is_active && activeEntry.started_at
      ? Math.floor((now - new Date(activeEntry.started_at).getTime()) / 1000)
      : 0;

  const handleStart = async () => {
    if (!user?.id || !currentWorkspace?.id) return;

    // If no task specified, we need one
    if (!taskId) {
      alert('Please select a task to track time');
      return;
    }

    await startTimeEntry.mutateAsync({
      userId: user.id,
      taskId,
      workspaceId: currentWorkspace.id,
      projectId,
      description: description || undefined,
    });
    setDescription('');
  };

  const handleStop = async () => {
    if (!activeEntry) return;

    await stopTimeEntry.mutateAsync({
      entryId: activeEntry.id,
      userId: user?.id || '',
      workspaceId: currentWorkspace?.id || '',
    });
  };

  const isTracking = activeEntry?.is_active;

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            {isTracking ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono font-bold">{formatDuration(elapsed)}</span>
                {activeEntry.task && (
                  <Badge variant="outline" className="text-xs">
                    {activeEntry.task.title}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="What are you working on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isTracking) {
                      handleStart();
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTracking ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleStop}
                disabled={stopTimeEntry.isPending}
              >
                <Pause className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStart}
              disabled={startTimeEntry.isPending || !taskId}
              size="icon"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
