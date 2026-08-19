-- Add a simpler policy for users to view their own workspace memberships
-- This complements the existing policy and handles the case where users
-- need to see their own memberships without circular dependencies

DROP POLICY IF EXISTS "Users can view own workspace memberships" ON workspace_members;

CREATE POLICY "Users can view own workspace memberships" ON workspace_members
  FOR SELECT USING (auth.uid() = user_id);
