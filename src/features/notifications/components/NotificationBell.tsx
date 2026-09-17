'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

const playNotificationSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};

export function NotificationBell({ userId }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousUnreadCount = useRef(0);

  useEffect(() => {
    if (!userId) return;
    let ignore = false;

    const load = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(userId, 10),
          notificationService.getNotificationCount(userId),
        ]);
        if (ignore) return;
        setNotifications(notifs);
        setUnreadCount(count.unread);
        previousUnreadCount.current = count.unread;
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    const subscription = notificationService.subscribeToNotifications(userId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setNotifications((prev) => [payload.new!, ...prev]);
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          // Play sound for new notifications if enabled
          if (soundEnabled && previousUnreadCount.current === 0) {
            playNotificationSound();
          }
          previousUnreadCount.current = newCount;
          return newCount;
        });
      } else if (payload.eventType === 'UPDATE') {
        setNotifications((prev) => prev.map((n) => (n.id === payload.new?.id ? payload.new! : n)));
        if (payload.new?.is_read && !payload.old?.is_read) {
          setUnreadCount((prev) => {
            const newCount = Math.max(0, prev - 1);
            previousUnreadCount.current = newCount;
            return newCount;
          });
        }
      } else if (payload.eventType === 'DELETE') {
        setNotifications((prev) => prev.filter((n) => n.id !== payload.old?.id));
        if (payload.old?.is_read === false) {
          setUnreadCount((prev) => {
            const newCount = Math.max(0, prev - 1);
            previousUnreadCount.current = newCount;
            return newCount;
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, soundEnabled]);

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

  const handleNotificationClick = (notification: Notification) => {
    const link = getNotificationLink(notification);
    if (link !== '#') {
      router.push(link);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn(
          'relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
            </Button>
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
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 ${
                !notification.is_read ? 'bg-muted/50' : ''
              }`}
              onClick={() => {
                if (!notification.is_read) {
                  handleMarkAsRead(notification.id);
                }
                handleNotificationClick(notification);
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
                {!notification.is_read && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
