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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';
import { useCreateInvitation } from '../hooks/useWorkspaceInvitations';

interface InviteMemberDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
}

const roles: { value: 'ADMIN' | 'MEMBER' | 'GUEST'; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'GUEST', label: 'Guest' },
];

export function InviteMemberDialog({ workspaceId, trigger }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'GUEST'>('MEMBER');
  const createInvitation = useCreateInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await createInvitation.mutateAsync({
        workspace_id: workspaceId,
        email,
        role,
      });
      setEmail('');
      setRole('MEMBER');
      setOpen(false);
    } catch (error) {
      console.error('Failed to create invitation:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="size-4 mr-2" />
            Invite
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>Send an invitation to join this workspace.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
            <Button type="submit" disabled={createInvitation.isPending}>
              {createInvitation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
