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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, CheckCircle, Archive, FolderKanban, Edit, Trash2 } from 'lucide-react';
import type { ProjectWithDetails } from '../types';

interface ProjectCardProps {
  project: ProjectWithDetails;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onActivate?: (id: string) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
}

export function ProjectCard({
  project,
  onView,
  onEdit,
  onArchive,
  onActivate,
  onDelete,
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
          {canEdit && (onEdit || onArchive || onActivate || onDelete) && (
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 size-8 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(project.id);
                      }}
                    >
                      <Edit className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onArchive && isActive && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive(project.id);
                      }}
                    >
                      <Archive className="size-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  {onActivate && !isActive && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivate(project.id);
                      }}
                    >
                      <CheckCircle className="size-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
