'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { User, Mail, Edit } from 'lucide-react';
import { EditProfileDialog } from './components/EditProfileDialog';

export default function SettingsPage() {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const username = user?.user_metadata?.username || 'Not set';
  const email = user?.email || 'Not set';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account profile</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={username} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-medium text-2xl">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">{username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{email}</p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setEditDialogOpen(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProfileDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} user={user} />
    </div>
  );
}
