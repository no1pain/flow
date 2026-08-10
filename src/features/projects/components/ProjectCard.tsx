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
import { MoreVertical, CheckCircle, Archive, FolderKanban } from 'lucide-react';
import type { ProjectWithDetails } from '../types';

interface ProjectCardProps {
  project: ProjectWithDetails;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onActivate?: (id: string) => void;
  canEdit?: boolean;
}

export function ProjectCard({
  project,
  onView,
  onEdit,
  onArchive: _onArchive,
  onActivate: _onActivate,
  canEdit = false,
}: ProjectCardProps) {
  const isActive = project.status === 'ACTIVE';

  return (
    <Card
      className="hover:ring-2 hover:ring-ring/50 transition-all cursor-pointer"
      onClick={() => onView(project.id)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FolderKanban className="size-5" />
            {project.name}
          </span>
          {canEdit && (
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(project.id);
                }}
              >
                <MoreVertical className="size-4" />
              </Button>
            </CardAction>
          )}
        </CardTitle>
        {project.description && (
          <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        )}
      </CardHeader>
      <CardFooter className="justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? (
              <>
                <CheckCircle className="size-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Archive className="size-3 mr-1" />
                Archived
              </>
            )}
          </Badge>
          {project.task_count !== undefined && (
            <span className="text-sm text-muted-foreground">
              {project.task_count} task{project.task_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView(project.id);
          }}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}
