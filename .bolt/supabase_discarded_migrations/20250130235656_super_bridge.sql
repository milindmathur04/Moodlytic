-- First drop existing policies
DROP POLICY IF EXISTS "groups_access_simple" ON groups;
DROP POLICY IF EXISTS "group_members_access_simple" ON group_members;

-- Create policy for groups with explicit member access
CREATE POLICY "groups_access_with_members"
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

-- Create policy for group members with explicit access
CREATE POLICY "group_members_access_with_lookup"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

-- Optimize indices for the new policies
DROP INDEX IF EXISTS idx_groups_creator_simple;
DROP INDEX IF EXISTS idx_members_lookup_simple;

CREATE INDEX idx_groups_members_lookup ON groups(id, created_by);
CREATE INDEX idx_members_email_lookup ON group_members(email, status);
CREATE INDEX idx_members_group_lookup ON group_members(group_id);