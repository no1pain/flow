-- Comments table (polymorphic - can be on tasks or documents)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'document')),
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_created_by ON comments(created_by);

-- Task activity audit log table
CREATE TABLE task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'priority_changed', 'assignee_changed', 'comment_added', 'deleted')),
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX idx_task_activity_user_id ON task_activity(user_id);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Workspace members can view comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = comments.entity_id
      AND comments.entity_type = 'task'
      AND EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = (
          SELECT workspace_id FROM projects WHERE projects.id = tasks.project_id
        )
        AND workspace_members.user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = comments.entity_id
      AND comments.entity_type = 'document'
      AND EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = documents.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Workspace members can insert comments" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = entity_id
      AND entity_type = 'task'
      AND EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = (
          SELECT workspace_id FROM projects WHERE projects.id = tasks.project_id
        )
        AND workspace_members.user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = entity_id
      AND entity_type = 'document'
      AND EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = documents.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for task_activity
CREATE POLICY "Workspace members can view task activity" ON task_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_activity.task_id
      AND EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = (
          SELECT workspace_id FROM projects WHERE projects.id = tasks.project_id
        )
        AND workspace_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Workspace members can insert task activity" ON task_activity
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = (
          SELECT workspace_id FROM projects WHERE projects.id = tasks.project_id
        )
        AND workspace_members.user_id = auth.uid()
      )
    )
  );

-- Trigger for comments updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
