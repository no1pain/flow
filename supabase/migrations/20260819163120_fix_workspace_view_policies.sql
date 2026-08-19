-- Fix workspace policies to allow members to see workspaces they belong to
-- This is needed because the simplified policies only allowed owners to see workspaces

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can insert workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete workspaces" ON workspaces;

-- Allow users to view workspaces they own OR are members of
CREATE POLICY "Users can view their workspaces" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Allow users to insert workspaces (they become owners)
CREATE POLICY "Users can insert workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Allow workspace owners to update workspaces
CREATE POLICY "Workspace owners can update workspaces" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

-- Allow workspace owners to delete workspaces
CREATE POLICY "Workspace owners can delete workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);
