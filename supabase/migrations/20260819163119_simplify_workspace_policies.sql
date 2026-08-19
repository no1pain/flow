-- Simplify workspaces policies to avoid recursion
-- The current policy uses workspace_members which could cause issues

-- Drop existing workspaces policies
DROP POLICY IF EXISTS "Workspace members can view workspace" ON workspaces;
DROP POLICY IF EXISTS "Users can insert workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete workspaces" ON workspaces;

-- Simple SELECT policy: users can view workspaces they own
CREATE POLICY "Users can view own workspaces" ON workspaces
  FOR SELECT USING (auth.uid() = owner_id);

-- Simple INSERT policy: users can create workspaces
CREATE POLICY "Users can insert workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Simple UPDATE policy: workspace owners can update their workspaces
CREATE POLICY "Workspace owners can update workspaces" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

-- Simple DELETE policy: workspace owners can delete their workspaces
CREATE POLICY "Workspace owners can delete workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);
