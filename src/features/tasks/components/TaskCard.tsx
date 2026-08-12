import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MoreVertical,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import type { TaskWithDetails, TaskStatus, TaskPriority } from '../types';

interface TaskCardProps {
  task: TaskWithDetails;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  canEdit?: boolean;
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

export function TaskCard({ task, onView, onEdit, canEdit = false }: TaskCardProps) {
  const priority = priorityConfig[task.priority as TaskPriority];
  const status = statusConfig[task.status as TaskStatus];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  return (
    <Card
      className="hover:ring-2 hover:ring-ring/50 transition-all cursor-pointer"
      onClick={() => onView(task.id)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <StatusIcon className="size-4" />
            {task.title}
          </span>
          {canEdit && (
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(task.id);
                }}
              >
                <MoreVertical className="size-4" />
              </Button>
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
