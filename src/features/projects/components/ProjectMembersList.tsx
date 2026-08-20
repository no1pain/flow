'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Crown, Shield, User } from 'lucide-react';
import { useProjectMembers, useRemoveProjectMember } from '../hooks/useProjects';

interface ProjectMembersListProps {
  projectId: string;
  canEdit?: boolean;
}

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
  GUEST: User,
};

const roleColors = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MEMBER: 'outline',
  GUEST: 'outline',
};

export function ProjectMembersList({ projectId, canEdit = false }: ProjectMembersListProps) {
  const { data: members, isLoading, error } = useProjectMembers(projectId);
  const removeMember = useRemoveProjectMember();

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember.mutateAsync(memberId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  if (isLoading) {
    return (
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    );
  }

  if (error) {
    return (
      <CardContent className="pt-6">
        <p className="text-sm text-red-600">Failed to load members</p>
      </CardContent>
    );
  }

  return (
    <CardContent>
      {!members || members.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          No members yet. Add team members to collaborate.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    {member.profile.avatar_url ? (
                      <AvatarImage src={member.profile.avatar_url} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.profile.username?.substring(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.profile.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          roleColors[member.role as keyof typeof roleColors] as
                            'default' | 'secondary' | 'outline' | 'destructive'
                        }
                        className="text-xs"
                      >
                        <RoleIcon className="size-3 mr-1" />
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                {canEdit && member.role !== 'OWNER' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removeMember.isPending}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  );
}
