-- Drop all existing policies first
DROP POLICY IF EXISTS "Groups access policy" ON groups;
DROP POLICY IF EXISTS "Group members access policy" ON group_members;
DROP POLICY IF EXISTS "Groups insert policy" ON groups;
DROP POLICY IF EXISTS "Groups select policy" ON groups;
DROP POLICY IF EXISTS "Groups update policy" ON groups;
DROP POLICY IF EXISTS "Groups delete policy" ON groups;
DROP POLICY IF EXISTS "Group members insert policy" ON group_members;
DROP POLICY IF EXISTS "Group members select policy" ON group_members;
DROP POLICY IF EXISTS "Group members update policy" ON group_members;
DROP POLICY IF EXISTS "Group members delete policy" ON group_members;

-- Create new simplified policies with unique names
CREATE POLICY "groups_all_access_policy_v2"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE group_members.group_id = id 
      AND group_members.email = auth.email()
    )
  )
  WITH CHECK (created_by = auth.uid());

-- Create new simplified group members policy with unique name
CREATE POLICY "group_members_all_access_policy_v2"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND (groups.created_by = auth.uid() OR group_members.email = auth.email())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Optimize indices
DROP INDEX IF EXISTS idx_group_members_email_status;
DROP INDEX IF EXISTS idx_groups_created_by;
CREATE INDEX IF NOT EXISTS idx_group_members_email_status_v2 ON group_members(email, status);
CREATE INDEX IF NOT EXISTS idx_groups_created_by_v2 ON groups(created_by);