'use client';

import { useParams } from 'next/navigation';
import { useWorkspaceWithMembers } from '@/features/workspace/hooks/useWorkspaces';
import { useWorkspaceMembers } from '@/features/workspace/hooks/useWorkspaceMembers';
import { useWorkspaceInvitations } from '@/features/workspace/hooks/useWorkspaceInvitations';
import { InviteMemberDialog } from '@/features/workspace/components/InviteMemberDialog';
import { Avatar } from '@/components/ui/avatar';
import type { WorkspaceMember, WorkspaceInvitationWithDetails } from '@/features/workspace/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Settings, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const router = useRouter();

  const { data: workspace, isLoading: workspaceLoading } = useWorkspaceWithMembers(workspaceId);
  const { data: members, isLoading: membersLoading } = useWorkspaceMembers(workspaceId);
  const { data: invitations } = useWorkspaceInvitations(workspaceId);

  if (workspaceLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Workspace not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{workspace.name}</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Created {new Date(workspace.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline">
            <Settings className="size-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Workspace information and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Members</p>
                    <p className="text-2xl font-bold">{workspace.member_count}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Projects</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Manage your workspace projects</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => router.push('/dashboard/projects')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Button variant="link" onClick={() => router.push('/dashboard/projects')}>
                    Go to Projects page to manage your workspace projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="size-4" />
                      Members
                    </CardTitle>
                    <CardDescription>Workspace team members</CardDescription>
                  </div>
                  <InviteMemberDialog workspaceId={workspaceId} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members?.map(
                    (member: WorkspaceMember & { profiles: { username: string | null } }) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <div className="size-full rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                              {member.profiles?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {member.profiles?.username || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {member.profiles?.username || 'User'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {invitations && invitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Invitations</CardTitle>
                  <CardDescription>Invitations waiting for response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invitations.map((invitation: WorkspaceInvitationWithDetails) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {invitation.role}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
