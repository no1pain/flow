export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: EntityType | null;
  entity_id: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NotificationInsert {
  id?: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type?: EntityType | null;
  entity_id?: string | null;
  is_read?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface NotificationUpdate {
  id?: string;
  user_id?: string;
  type?: NotificationType;
  title?: string;
  message?: string;
  entity_type?: EntityType | null;
  entity_id?: string | null;
  is_read?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export type NotificationType =
  | 'comment'
  | 'mention'
  | 'task_assigned'
  | 'task_updated'
  | 'task_status_changed'
  | 'task_priority_changed'
  | 'document_shared'
  | 'workspace_invitation';

export type EntityType = 'task' | 'document' | 'workspace' | 'project';

export interface NotificationWithMetadata extends Notification {
  metadata: {
    comment_id?: string;
    commenter_id?: string;
    mentioner_id?: string;
    username?: string;
    task_id?: string;
    assigner_id?: string;
    old_status?: string;
    new_status?: string;
    changed_by?: string;
  };
}

export interface NotificationCount {
  total: number;
  unread: number;
}
