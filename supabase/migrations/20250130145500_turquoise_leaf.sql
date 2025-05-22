-- Drop existing policies
DROP POLICY IF EXISTS "groups_select_final" ON groups;
DROP POLICY IF EXISTS "groups_insert_final" ON groups;
DROP POLICY IF EXISTS "groups_update_final" ON groups;
DROP POLICY IF EXISTS "groups_delete_final" ON groups;

-- Create separate policies for groups with fixed insert policy
CREATE POLICY "groups_select_v4"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.email = auth.email()
      AND group_members.status = 'active'
    )
  );

-- Simplified insert policy that only checks the created_by field
CREATE POLICY "groups_insert_v4"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "groups_update_v4"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_delete_v4"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Optimize indices
DROP INDEX IF EXISTS idx_groups_creator_final;
CREATE INDEX idx_groups_creator_v4 ON groups(created_by);