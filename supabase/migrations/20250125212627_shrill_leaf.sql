-- Drop existing policies
DROP POLICY IF EXISTS "groups_policy" ON groups;
DROP POLICY IF EXISTS "group_members_policy" ON group_members;

-- Create simplified policy for groups
CREATE POLICY "groups_access"
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
CREATE POLICY "group_members_access"
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

-- Optimize indices for the new policies
DROP INDEX IF EXISTS idx_groups_policy;
DROP INDEX IF EXISTS idx_group_members_policy;

CREATE INDEX idx_groups_access ON groups(created_by);
CREATE INDEX idx_group_members_access ON group_members(email, group_id) WHERE status = 'active';