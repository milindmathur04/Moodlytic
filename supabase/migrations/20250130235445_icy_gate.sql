-- First drop existing policies
DROP POLICY IF EXISTS "groups_access_simple" ON groups;
DROP POLICY IF EXISTS "group_members_access_simple" ON group_members;

-- Create policy for groups that allows nested selections
CREATE POLICY "groups_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid()
  )
  WITH CHECK (
    created_by = auth.uid()
  );

-- Create separate read policy for groups
CREATE POLICY "groups_read"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = auth.email() 
      AND status = 'active'
    )
  );

-- Create policy for group members
CREATE POLICY "group_members_access"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
    OR email = auth.email()
  )
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

-- Optimize indices
DROP INDEX IF EXISTS idx_groups_creator_simple;
DROP INDEX IF EXISTS idx_members_lookup_simple;

CREATE INDEX idx_groups_lookup ON groups(id, created_by);
CREATE INDEX idx_members_lookup ON group_members(group_id, email, status);