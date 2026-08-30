'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Edit2 } from 'lucide-react';
import { useTimeEntries, useDeleteTimeEntry } from '../hooks/useTimeTracking';
import { useWorkspaceStore } from '@/features/workspace/store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { formatDurationHuman } from '@/lib/utils/time';
import { Input } from '@/components/ui/input';
import { useUpdateTimeEntry } from '../hooks/useTimeTracking';

export function TimeEntriesList() {
  const { user } = useAuth();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const { data: entries, isLoading } = useTimeEntries(user?.id || '', currentWorkspace?.id || '');
  const deleteTimeEntry = useDeleteTimeEntry();
  const updateTimeEntry = useUpdateTimeEntry();

  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const handleEdit = (entryId: string, currentDescription: string) => {
    setEditingEntry(entryId);
    setEditDescription(currentDescription || '');
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !user?.id || !currentWorkspace?.id) return;

    await updateTimeEntry.mutateAsync({
      entryId: editingEntry,
      updates: { description: editDescription || undefined },
      userId: user.id,
      workspaceId: currentWorkspace.id,
    });

    setEditingEntry(null);
    setEditDescription('');
  };

  const handleDelete = (entryId: string) => {
    setEntryToDelete(entryId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEntry = async () => {
    if (!entryToDelete || !user?.id || !currentWorkspace?.id) return;

    await deleteTimeEntry.mutateAsync({
      entryId: entryToDelete,
      userId: user.id,
      workspaceId: currentWorkspace.id,
    });
    setEntryToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No time entries yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">
                    {formatDurationHuman(entry.duration || 0)}
                  </Badge>
                  {entry.task && (
                    <Badge variant="secondary" className="text-xs">
                      {entry.task.title}
                    </Badge>
                  )}
                  {entry.project && (
                    <Badge variant="outline" className="text-xs">
                      {entry.project.name}
                    </Badge>
                  )}
                </div>

                {editingEntry === entry.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add a description..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingEntry(null);
                          setEditDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.started_at), { addSuffix: true })}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(entry.id, entry.description || '')}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Time Entry"
        description="Are you sure you want to delete this time entry? This action cannot be undone."
        onConfirm={confirmDeleteEntry}
        cancelText="Cancel"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
