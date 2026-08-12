'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  MessageSquare,
  GripVertical,
} from 'lucide-react';
import type { TaskWithDetails } from '../types';

interface KanbanTaskCardProps {
  task: TaskWithDetails;
  isDragging?: boolean;
}

const priorityConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  LOW: { label: 'Low', color: 'secondary', icon: ArrowRight },
  MEDIUM: { label: 'Medium', color: 'default', icon: ArrowRight },
  HIGH: { label: 'High', color: 'destructive', icon: ArrowUp },
  URGENT: { label: 'Urgent', color: 'destructive', icon: AlertCircle },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  TODO: { label: 'Todo', color: 'secondary', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'default', icon: ArrowRight },
  DONE: { label: 'Done', color: 'default', icon: CheckCircle2 },
};

export function KanbanTaskCard({ task, isDragging = false }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-testid={`task-card-${task.id}`}
      className={`hover:ring-2 hover:ring-ring/50 transition-all cursor-grab active:cursor-grabbing ${isDragging || isSortableDragging ? 'opacity-50' : ''
        }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 mt-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <StatusIcon className="size-4 flex-shrink-0" />
              <span className="truncate">{task.title}</span>
            </CardTitle>
            {task.description && (
              <CardDescription className="line-clamp-2 text-sm mt-1">
                {task.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardFooter className="pt-0 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={priority.color as 'default' | 'secondary' | 'destructive' | 'outline'}>
            <PriorityIcon className="size-3 mr-1" />
            {priority.label}
          </Badge>
          {task.comment_count !== undefined && task.comment_count > 0 && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="size-3" />
              {task.comment_count}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar className="size-6 flex-shrink-0">
            <AvatarImage src={task.assignee.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {task.assignee.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </CardFooter>
    </Card>
  );
}
