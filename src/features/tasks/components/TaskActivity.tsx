'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Clock, CheckCircle, ArrowUp, User, MessageSquare, Trash2 } from 'lucide-react';
import type { TaskActivityWithProfile } from '../types';

interface TaskActivityProps {
  activities: TaskActivityWithProfile[];
  loading?: boolean;
}

const actionConfig = {
  created: { icon: CheckCircle, label: 'created this task', color: 'text-green-500' },
  updated: { icon: Clock, label: 'updated this task', color: 'text-blue-500' },
  status_changed: { icon: CheckCircle, label: 'changed status', color: 'text-purple-500' },
  priority_changed: { icon: ArrowUp, label: 'changed priority', color: 'text-orange-500' },
  assignee_changed: { icon: User, label: 'changed assignee', color: 'text-cyan-500' },
  comment_added: { icon: MessageSquare, label: 'added a comment', color: 'text-pink-500' },
  deleted: { icon: Trash2, label: 'deleted this task', color: 'text-red-500' },
};

export function TaskActivity({ activities, loading = false }: TaskActivityProps) {
  const formatChanges = (changes: Record<string, unknown> | null | undefined) => {
    if (!changes) return null;

    const entries = Object.entries(changes);
    if (entries.length === 0) return null;

    return entries.map(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        return (
          <span key={key} className="text-sm">
            {key}: <span className="line-through text-muted-foreground">{String(value.from)}</span>{' '}
            → <span className="font-medium">{String(value.to)}</span>
          </span>
        );
      }
      return null;
    });
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading activity...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No activity yet.</div>;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = actionConfig[activity.action as keyof typeof actionConfig];
        const Icon = config.icon;

        return (
          <div key={activity.id} className="flex gap-3 text-sm">
            <Avatar className="size-6">
              <AvatarImage src={activity.profile.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {activity.profile.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{activity.profile.username}</span>
                <Icon className={`h-3 w-3 ${config.color}`} />
                <span className="text-muted-foreground">{config.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
              {activity.changes && (
                <div className="pl-6 space-y-1 text-muted-foreground">
                  {formatChanges(activity.changes as Record<string, unknown> | null)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
