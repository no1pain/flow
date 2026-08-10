-- Project members table
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'GUEST')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create indexes
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- Enable Row Level Security
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_members
CREATE POLICY "Workspace members can view project members" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = (
        SELECT workspace_id FROM projects WHERE projects.id = project_members.project_id
      )
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace admins can insert project members" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = (
        SELECT workspace_id FROM projects WHERE projects.id = project_members.project_id
      )
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Workspace admins can update project members" ON project_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = (
        SELECT workspace_id FROM projects WHERE projects.id = project_members.project_id
      )
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Workspace admins can delete project members" ON project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = (
        SELECT workspace_id FROM projects WHERE projects.id = project_members.project_id
      )
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('OWNER', 'ADMIN')
    )
  );

-- Trigger to automatically add project creator as owner
CREATE OR REPLACE FUNCTION add_project_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'OWNER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_add_project_creator_as_member
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION add_project_creator_as_member();
