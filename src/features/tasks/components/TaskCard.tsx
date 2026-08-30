'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  MessageSquare,
  Edit,
} from 'lucide-react';
import type { TaskWithDetails, TaskStatus, TaskPriority } from '../types';

interface TaskCardProps {
  task: TaskWithDetails;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  canEdit?: boolean;
  onStatusToggle?: (id: string) => void;
}

const priorityConfig = {
  LOW: { label: 'Low', color: 'secondary', icon: ArrowRight },
  MEDIUM: { label: 'Medium', color: 'default', icon: ArrowRight },
  HIGH: { label: 'High', color: 'destructive', icon: ArrowUp },
  URGENT: { label: 'Urgent', color: 'destructive', icon: AlertCircle },
};

const statusConfig = {
  TODO: { label: 'Todo', color: 'secondary', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'default', icon: ArrowRight },
  DONE: { label: 'Done', color: 'default', icon: CheckCircle2 },
};

export function TaskCard({ task, onView, onEdit, canEdit = false, onStatusToggle }: TaskCardProps) {
  const priority = priorityConfig[task.priority as TaskPriority];
  const status = statusConfig[task.status as TaskStatus];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusToggle?.(task.id);
  };

  return (
    <Card
      className="hover:ring-2 hover:ring-ring/50 transition-all cursor-pointer"
      onClick={() => onView(task.id)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <button
              onClick={handleStatusToggle}
              className="flex-shrink-0 hover:scale-110 transition-transform"
              disabled={!onStatusToggle}
            >
              <StatusIcon className="size-4" />
            </button>
            {task.title}
          </span>
          {canEdit && onEdit && (
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 size-8 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task.id);
                    }}
                  >
                    <Edit className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          )}
        </CardTitle>
        {task.description && (
          <CardDescription className="line-clamp-2">{task.description}</CardDescription>
        )}
      </CardHeader>
      <CardFooter className="justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={priority.color as 'default' | 'secondary' | 'destructive' | 'outline'}>
            <PriorityIcon className="size-3 mr-1" />
            {priority.label}
          </Badge>
          <Badge variant={status.color as 'default' | 'secondary' | 'destructive' | 'outline'}>
            <StatusIcon className="size-3 mr-1" />
            {status.label}
          </Badge>
          {task.comment_count !== undefined && task.comment_count > 0 && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="size-3" />
              {task.comment_count}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar className="size-6">
            <AvatarImage src={task.assignee.avatar_url || undefined} />
            <AvatarFallback>{task.assignee.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </CardFooter>
    </Card>
  );
}
