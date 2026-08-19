-- Add INSERT and UPDATE policies for workspaces table
-- Currently workspaces only has SELECT policy

-- Drop policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can insert workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update workspaces" ON workspaces;

-- Allow users to insert workspaces (they become owners)
CREATE POLICY "Users can insert workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Allow workspace owners and admins to update workspaces
CREATE POLICY "Workspace owners can update workspaces" ON workspaces
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('OWNER', 'ADMIN')
    )
  );
