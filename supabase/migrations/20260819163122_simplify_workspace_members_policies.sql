-- Simplify workspace_members policies to avoid recursion
-- Use a direct check without the EXISTS subquery

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can insert themselves into workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Users can update own workspace membership" ON workspace_members;
DROP POLICY IF EXISTS "Users can delete own workspace membership" ON workspace_members;

-- Simple policy: users can only see their own workspace memberships
CREATE POLICY "Users can view own workspace memberships" ON workspace_members
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert themselves into workspaces
CREATE POLICY "Users can insert themselves into workspaces" ON workspace_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own membership
CREATE POLICY "Users can update own workspace membership" ON workspace_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to remove their own membership
CREATE POLICY "Users can delete own workspace membership" ON workspace_members
  FOR DELETE USING (auth.uid() = user_id);
