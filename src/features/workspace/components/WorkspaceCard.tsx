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
import { MoreVertical, Users, Edit, Trash2 } from 'lucide-react';
import type { WorkspaceWithMembers } from '../types';

interface WorkspaceCardProps {
  workspace: WorkspaceWithMembers;
  onSwitch: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  currentRole?: string;
}

export function WorkspaceCard({
  workspace,
  onSwitch,
  onEdit,
  onDelete,
  currentRole,
}: WorkspaceCardProps) {
  const canEdit = currentRole === 'OWNER' || currentRole === 'ADMIN';
  const canDelete = currentRole === 'OWNER';

  return (
    <Card
      className="hover:ring-2 hover:ring-ring/50 transition-all cursor-pointer"
      onClick={() => onSwitch(workspace.id)}
    >
      <CardHeader>
        <CardTitle>{workspace.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Users className="size-4" />
          {workspace.member_count} member{workspace.member_count !== 1 ? 's' : ''}
        </CardDescription>
        {(canEdit && onEdit) || (canDelete && onDelete) ? (
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 size-8 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {onEdit && canEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(workspace.id);
                    }}
                  >
                    <Edit className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && canDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(workspace.id);
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
        ) : null}
      </CardHeader>
      <CardFooter className="justify-between">
        <Badge variant="secondary">{currentRole || 'MEMBER'}</Badge>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSwitch(workspace.id);
          }}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}
