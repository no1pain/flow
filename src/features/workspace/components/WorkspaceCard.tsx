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
import { MoreVertical, Users } from 'lucide-react';
import type { WorkspaceWithMembers } from '../types';

interface WorkspaceCardProps {
  workspace: WorkspaceWithMembers;
  onSwitch: (id: string) => void;
  onEdit?: (id: string) => void;
  currentRole?: string;
}

export function WorkspaceCard({ workspace, onSwitch, onEdit, currentRole }: WorkspaceCardProps) {
  const canEdit = currentRole === 'OWNER' || currentRole === 'ADMIN';

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
        {canEdit && (
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(workspace.id);
              }}
            >
              <MoreVertical className="size-4" />
            </Button>
          </CardAction>
        )}
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
