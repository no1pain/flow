-- Workspace invitations table
CREATE TABLE workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MEMBER', 'GUEST')),
  invited_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(workspace_id, email, status)
);

CREATE INDEX idx_workspace_invitations_workspace ON workspace_invitations(workspace_id);
CREATE INDEX idx_workspace_invitations_email ON workspace_invitations(email, status);

-- Enable RLS
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_invitations
CREATE POLICY "Workspace members can view invitations" ON workspace_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_invitations.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace admins can create invitations" ON workspace_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_invitations.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Invited users can update their invitation" ON workspace_invitations
  FOR UPDATE USING (
    auth.uid() = invited_by
    OR (
      status = 'PENDING'
      AND email IN (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Function to check if user is workspace editor
CREATE OR REPLACE FUNCTION is_workspace_editor(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id 
    AND user_id = auth.uid()
    AND role IN ('OWNER', 'ADMIN')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Update workspaces RLS to allow owners/admins to insert/update
DROP POLICY IF EXISTS "Workspace members can view workspace" ON workspaces;

CREATE POLICY "Workspace members can view workspace" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace editors can update workspaces" ON workspaces
  FOR UPDATE USING (is_workspace_editor(id))
  WITH CHECK (is_workspace_editor(id));

CREATE POLICY "Workspace owners can delete workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- Update workspace_members RLS for role-based access
DROP POLICY IF EXISTS "Workspace members can view members" ON workspace_members;

CREATE POLICY "Workspace members can view members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_members.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace editors can add members" ON workspace_members
  FOR INSERT WITH CHECK (is_workspace_editor(workspace_id));

CREATE POLICY "Workspace editors can update member roles" ON workspace_members
  FOR UPDATE USING (is_workspace_editor(workspace_id))
  WITH CHECK (is_workspace_editor(workspace_id));

CREATE POLICY "Workspace editors can remove members" ON workspace_members
  FOR DELETE USING (is_workspace_editor(workspace_id));

-- Update projects RLS
DROP POLICY IF EXISTS "Workspace members can view projects" ON projects;

CREATE POLICY "Workspace members can view projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace editors can create projects" ON projects
  FOR INSERT WITH CHECK (is_workspace_editor(workspace_id));

CREATE POLICY "Workspace editors can update projects" ON projects
  FOR UPDATE USING (is_workspace_editor(workspace_id))
  WITH CHECK (is_workspace_editor(workspace_id));

CREATE POLICY "Workspace editors can delete projects" ON projects
  FOR DELETE USING (is_workspace_editor(workspace_id));

-- Update tasks RLS
DROP POLICY IF EXISTS "Workspace members can view tasks" ON tasks;

CREATE POLICY "Workspace members can view tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = (
        SELECT workspace_id FROM projects WHERE projects.id = tasks.project_id
      )
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace editors can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      JOIN projects p ON p.workspace_id = wm.workspace_id
      WHERE p.id = tasks.project_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Workspace editors can update tasks" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      JOIN projects p ON p.workspace_id = wm.workspace_id
      WHERE p.id = tasks.project_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      JOIN projects p ON p.workspace_id = wm.workspace_id
      WHERE p.id = tasks.project_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "Workspace editors can delete tasks" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      JOIN projects p ON p.workspace_id = wm.workspace_id
      WHERE p.id = tasks.project_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
    )
  );

-- Update documents RLS
DROP POLICY IF EXISTS "Workspace members can view documents" ON documents;

CREATE POLICY "Workspace members can view documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = documents.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace editors can create documents" ON documents
  FOR INSERT WITH CHECK (is_workspace_editor(workspace_id));

CREATE POLICY "Workspace editors can update documents" ON documents
  FOR UPDATE USING (is_workspace_editor(workspace_id))
  WITH CHECK (is_workspace_editor(workspace_id));

CREATE POLICY "Workspace editors can delete documents" ON documents
  FOR DELETE USING (is_workspace_editor(workspace_id));
