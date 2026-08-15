-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'mention', 'task_assigned', 'task_updated', 'task_status_changed', 'task_priority_changed', 'document_shared', 'workspace_invitation')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('task', 'document', 'workspace', 'project')),
  entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Function to create notification on comment
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the task/document creator and assignee about new comment
  IF NEW.entity_type = 'task' THEN
    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, metadata)
    SELECT 
      tasks.created_by,
      'comment',
      'New comment on task',
      'A new comment was added to your task',
      'task',
      NEW.entity_id,
      jsonb_build_object('comment_id', NEW.id, 'commenter_id', NEW.created_by)
    FROM tasks
    WHERE tasks.id = NEW.entity_id
    AND tasks.created_by != NEW.created_by
    ON CONFLICT DO NOTHING;

    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, metadata)
    SELECT 
      tasks.assignee_id,
      'comment',
      'New comment on assigned task',
      'A new comment was added to a task assigned to you',
      'task',
      NEW.entity_id,
      jsonb_build_object('comment_id', NEW.id, 'commenter_id', NEW.created_by)
    FROM tasks
    WHERE tasks.id = NEW.entity_id
    AND tasks.assignee_id IS NOT NULL
    AND tasks.assignee_id != NEW.created_by
    AND tasks.assignee_id != tasks.created_by
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification on comment insert
CREATE TRIGGER trigger_comment_notification
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_comment_notification();

-- Function to parse mentions and create mention notifications
CREATE OR REPLACE FUNCTION create_mention_notifications()
RETURNS TRIGGER AS $$
DECLARE
  mention_username TEXT;
  mentioned_user_id UUID;
  pos INT;
  remaining_text TEXT;
BEGIN
  -- Parse @mentions from comment content
  remaining_text := NEW.content;
  
  LOOP
    pos := position('@' in remaining_text);
    EXIT WHEN pos = 0;
    
    remaining_text := substring(remaining_text FROM pos);
    -- Extract username (alphanumeric and underscores)
    mention_username := regexp_replace(substring(remaining_text FROM 2), '[^a-zA-Z0-9_].*', '');
    
    IF length(mention_username) > 0 THEN
      -- Find user by username
      SELECT id INTO mentioned_user_id FROM profiles WHERE username = mention_username;
      
      IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.created_by THEN
        INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, metadata)
        VALUES (
          mentioned_user_id,
          'mention',
          'You were mentioned',
          'You were mentioned in a comment',
          NEW.entity_type,
          NEW.entity_id,
          jsonb_build_object('comment_id', NEW.id, 'mentioner_id', NEW.created_by, 'username', mention_username)
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
    
    -- Move past this mention
    remaining_text := substring(remaining_text FROM length(mention_username) + 2);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create mention notifications on comment insert
CREATE TRIGGER trigger_mention_notifications
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_mention_notifications();

-- Function to create notification on task assignment
CREATE OR REPLACE FUNCTION create_task_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.assignee_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, metadata)
      VALUES (
        NEW.assignee_id,
        'task_assigned',
        'Task assigned to you',
        'You have been assigned a new task',
        'task',
        NEW.id,
        jsonb_build_object('task_id', NEW.id, 'assigner_id', NEW.created_by)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.assignee_id IS NULL AND NEW.assignee_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, metadata)
      VALUES (
        NEW.assignee_id,
        'task_assigned',
        'Task assigned to you',
        'You have been assigned a new task',
        'task',
        NEW.id,
        jsonb_build_object('task_id', NEW.id, 'assigner_id', auth.uid())
      );
    ELSIF OLD.assignee_id IS NOT NULL AND NEW.assignee_id IS NOT NULL AND OLD.assignee_id != NEW.assignee_id THEN
      INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, metadata)
      VALUES (
        NEW.assignee_id,
        'task_assigned',
        'Task reassigned to you',
        'A task has been reassigned to you',
        'task',
        NEW.id,
        jsonb_build_object('task_id', NEW.id, 'assigner_id', auth.uid())
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification on task assignment
CREATE TRIGGER trigger_task_assignment_notification
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW WHEN (NEW.assignee_id IS DISTINCT FROM OLD.assignee_id OR NULLIF(OLD.assignee_id, NEW.assignee_id) IS NOT NULL)
  EXECUTE FUNCTION create_task_assignment_notification();

-- Function to create notification on task status change
CREATE OR REPLACE FUNCTION create_task_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, metadata)
    VALUES (
      NEW.created_by,
      'task_status_changed',
      'Task status changed',
      'The status of your task has been changed',
      'task',
      NEW.id,
      jsonb_build_object('task_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status, 'changed_by', auth.uid())
    );
    
    IF NEW.assignee_id IS NOT NULL AND NEW.assignee_id != NEW.created_by THEN
      INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, metadata)
      VALUES (
        NEW.assignee_id,
        'task_status_changed',
        'Task status changed',
        'The status of a task assigned to you has been changed',
        'task',
        NEW.id,
        jsonb_build_object('task_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status, 'changed_by', auth.uid())
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification on task status change
CREATE TRIGGER trigger_task_status_notification
  AFTER UPDATE ON tasks
  FOR EACH ROW WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION create_task_status_notification();
