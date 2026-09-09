'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';
import { useAddWorkspaceMember } from '../hooks/useWorkspaceMembers';
import { UserSelector } from '@/components/ui/user-selector';
import type { UserProfile } from '@/features/auth/services';
import { cn } from '@/lib/utils';

interface InviteMemberDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
  existingMemberIds?: string[];
}

const roles: { value: 'ADMIN' | 'MEMBER' | 'GUEST'; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'GUEST', label: 'Guest' },
];

export function InviteMemberDialog({
  workspaceId,
  trigger,
  existingMemberIds = [],
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'GUEST'>('MEMBER');
  const addMember = useAddWorkspaceMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await addMember.mutateAsync({
        workspace_id: workspaceId,
        user_id: selectedUser.id,
        role,
      });
      setSelectedUser(null);
      setRole('MEMBER');
      setOpen(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {trigger || (
          <>
            <UserPlus className="size-3.5 mr-2" />
            Invite
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>Select a user to add to this workspace.</DialogDescription>
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
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex gap-2">
                {roles.map((r) => (
                  <Badge
                    key={r.value}
                    variant={role === r.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setRole(r.value)}
                  >
                    {r.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMember.isPending || !selectedUser}>
              {addMember.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
