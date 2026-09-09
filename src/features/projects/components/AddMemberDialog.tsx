'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserSelector } from '@/components/ui/user-selector';
import { addProjectMember } from '../actions';
import type { ProjectMemberRole } from '../types';
import type { UserProfile } from '@/features/auth/services';

interface AddMemberDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMemberIds?: string[];
}

export function AddMemberDialog({
  projectId,
  open,
  onOpenChange,
  existingMemberIds = [],
}: AddMemberDialogProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<ProjectMemberRole>('MEMBER');
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsPending(true);
    try {
      await addProjectMember({
        project_id: projectId,
        user_id: selectedUser.id,
        role,
      });
      setSelectedUser(null);
      setRole('MEMBER');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Select a user to add to this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <UserSelector
                value={selectedUser}
                onChange={setSelectedUser}
                excludeIds={existingMemberIds}
                placeholder="Search users by username..."
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as ProjectMemberRole)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isPending}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !selectedUser}>
              {isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
