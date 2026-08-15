'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '../services';
import type { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(userId, 10),
        notificationService.getNotificationCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count.unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    const subscription = notificationService.subscribeToNotifications(userId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setNotifications((prev) => [payload.new!, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } else if (payload.eventType === 'UPDATE') {
        setNotifications((prev) =>
          prev.map((n) => (n.id === payload.new?.id ? payload.new! : n))
        );
        if (payload.new?.is_read && !payload.old?.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } else if (payload.eventType === 'DELETE') {
        setNotifications((prev) => prev.filter((n) => n.id !== payload.old?.id));
        if (payload.old?.is_read === false) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 ${!notification.is_read ? 'bg-muted/50' : ''
                }`}
              onClick={() => {
                if (!notification.is_read) {
                  handleMarkAsRead(notification.id);
                }
                window.location.href = getNotificationLink(notification);
              }}
            >
              <div className="flex items-start gap-2 w-full">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
