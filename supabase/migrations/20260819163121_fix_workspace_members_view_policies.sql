-- Fix workspace_members policies to allow users to see members in workspaces they belong to
-- This is needed for the workspaces list to properly show workspace details

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can insert themselves into workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Users can update own workspace membership" ON workspace_members;
DROP POLICY IF EXISTS "Users can delete own workspace membership" ON workspace_members;

-- Allow users to view workspace memberships in workspaces they belong to
CREATE POLICY "Users can view workspace memberships" ON workspace_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM workspace_members as wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Allow users to insert themselves into workspaces
CREATE POLICY "Users can insert themselves into workspaces" ON workspace_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own membership
CREATE POLICY "Users can update own workspace membership" ON workspace_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to remove their own membership
CREATE POLICY "Users can delete own workspace membership" ON workspace_members
  FOR DELETE USING (auth.uid() = user_id);
