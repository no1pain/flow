-- Fix RLS policies for workspace_members table
-- The original policy had a self-comparison bug

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Workspace members can view members" ON workspace_members;

-- Create the correct policy with proper table alias
CREATE POLICY "Workspace members can view members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members as wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Add INSERT policy for workspace_members to allow users to join workspaces
CREATE POLICY "Users can insert workspace members" ON workspace_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_members.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('OWNER', 'ADMIN')
    )
  );

-- Add UPDATE policy for workspace_members
CREATE POLICY "Users can update workspace members" ON workspace_members
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM workspace_members as wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
    )
  );

-- Add DELETE policy for workspace_members
CREATE POLICY "Users can delete workspace members" ON workspace_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM workspace_members as wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
    )
  );
