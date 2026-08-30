'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '../services';
import type { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotificationCenterProps {
  userId: string;
}

type FilterType = 'all' | 'unread' | 'read';

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: notifications = [], isLoading: loading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationService.getNotifications(userId, 50),
    enabled: !!userId,
  });

  useEffect(() => {
    const subscription = notificationService.subscribeToNotifications(userId, (payload) => {
      queryClient.setQueryData<Notification[]>(['notifications', userId], (prev = []) => {
        if (payload.eventType === 'INSERT') {
          return [payload.new!, ...prev];
        }
        if (payload.eventType === 'UPDATE') {
          return prev.map((n) => (n.id === payload.new?.id ? payload.new! : n));
        }
        if (payload.eventType === 'DELETE') {
          return prev.filter((n) => n.id !== payload.old?.id);
        }
        return prev;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      queryClient.setQueryData<Notification[]>(['notifications', userId], (prev = []) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      queryClient.setQueryData<Notification[]>(['notifications', userId], (prev = []) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      queryClient.setQueryData<Notification[]>(['notifications', userId], (prev = []) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearNotifications(userId);
      queryClient.setQueryData<Notification[]>(['notifications', userId], []);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return '💬';
      case 'mention':
        return '@';
      case 'task_assigned':
        return '📋';
      case 'task_updated':
        return '✏️';
      case 'task_status_changed':
        return '🔄';
      case 'task_priority_changed':
        return '⚡';
      case 'document_shared':
        return '📄';
      case 'workspace_invitation':
        return '📧';
      default:
        return '🔔';
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (!notification.entity_id) return '#';

    switch (notification.entity_type) {
      case 'task':
        return `/dashboard/tasks/${notification.entity_id}`;
      case 'document':
        return `/dashboard/documents/${notification.entity_id}`;
      case 'project':
        return `/dashboard/projects/${notification.entity_id}`;
      case 'workspace':
        return `/dashboard/workspaces/${notification.entity_id}`;
      default:
        return '#';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    const link = getNotificationLink(notification);
    if (link !== '#') {
      router.push(link);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            {filter === 'unread'
              ? "You're all caught up!"
              : filter === 'read'
                ? 'No read notifications yet'
                : 'No notifications yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-colors hover:bg-muted/50 ${
                !notification.is_read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs mt-2"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
