-- First drop existing policies
DROP POLICY IF EXISTS "groups_access" ON groups;
DROP POLICY IF EXISTS "groups_read" ON groups;
DROP POLICY IF EXISTS "group_members_access" ON group_members;

-- Drop indices from last migration
DROP INDEX IF EXISTS idx_groups_lookup;
DROP INDEX IF EXISTS idx_members_lookup;

-- Create single simplified policy for groups
CREATE POLICY "groups_access_simple"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid()
  )
  WITH CHECK (
    created_by = auth.uid()
  );

-- Create single simplified policy for group members
CREATE POLICY "group_members_access_simple"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
    OR email = auth.email()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

-- Recreate previous indices
CREATE INDEX idx_groups_creator_simple ON groups(created_by);
CREATE INDEX idx_members_lookup_simple ON group_members(group_id, email);