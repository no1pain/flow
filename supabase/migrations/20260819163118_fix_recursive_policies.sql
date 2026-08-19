-- Fix infinite recursion in workspace_members policies
-- Replace complex recursive policies with simpler ones

-- Drop all existing workspace_members policies
DROP POLICY IF EXISTS "Workspace members can view members" ON workspace_members;
DROP POLICY IF EXISTS "Users can view own workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can insert workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can update workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can delete workspace members" ON workspace_members;

-- Simple SELECT policy: users can see their own workspace memberships
CREATE POLICY "Users can view own workspace memberships" ON workspace_members
  FOR SELECT USING (auth.uid() = user_id);

-- Simple INSERT policy: users can add themselves to workspaces
CREATE POLICY "Users can insert themselves into workspaces" ON workspace_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Simple UPDATE policy: users can update their own membership
CREATE POLICY "Users can update own workspace membership" ON workspace_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Simple DELETE policy: users can remove their own membership
CREATE POLICY "Users can delete own workspace membership" ON workspace_members
  FOR DELETE USING (auth.uid() = user_id);
