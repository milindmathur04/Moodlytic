-- First drop existing policies
DROP POLICY IF EXISTS "groups_access_simple" ON groups;
DROP POLICY IF EXISTS "group_members_access_simple" ON group_members;

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

-- Recreate indices
DROP INDEX IF EXISTS idx_groups_creator;
DROP INDEX IF EXISTS idx_members_email_status;
DROP INDEX IF EXISTS idx_members_group_id;
DROP INDEX IF EXISTS idx_groups_creator_simple;
DROP INDEX IF EXISTS idx_members_lookup_simple;

CREATE INDEX idx_groups_creator_simple ON groups(created_by);
CREATE INDEX idx_members_lookup_simple ON group_members(group_id, email);