-- First drop existing policies
DROP POLICY IF EXISTS "groups_all_access" ON groups;
DROP POLICY IF EXISTS "groups_member_access" ON groups;
DROP POLICY IF EXISTS "members_creator_access" ON group_members;
DROP POLICY IF EXISTS "members_self_access" ON group_members;
DROP POLICY IF EXISTS "members_self_update" ON group_members;

-- Create simplified policy for groups
CREATE POLICY "groups_access_fixed"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = auth.email() 
      AND status = 'active'
    )
  )
  WITH CHECK (created_by = auth.uid());

-- Create simplified policy for group members
CREATE POLICY "group_members_access_fixed"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    email = auth.email() OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

-- Optimize indices
DROP INDEX IF EXISTS idx_groups_creator_v6;
DROP INDEX IF EXISTS idx_members_email_v6;
DROP INDEX IF EXISTS idx_members_group_v6;
DROP INDEX IF EXISTS idx_members_status_v6;

CREATE INDEX idx_groups_creator_fixed ON groups(created_by);
CREATE INDEX idx_members_composite_fixed ON group_members(group_id, email, status);